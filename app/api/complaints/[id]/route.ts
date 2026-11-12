import { NextRequest } from 'next/server';
import { getPool } from '@/lib/mysql';
import { getDriver } from '@/lib/neo4j';
import { getCaller } from '@/lib/authz';

type Ctx = { params: Promise<{ id: string }> };

// ---------- READ ----------
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const caller = await getCaller(req);
  if (!caller) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const pool = getPool();

  const [rows]: any = await pool.query(`
    SELECT c.id, c.graph_ref_id, c.status, c.is_anonymous, c.created_at,
           cc.name AS category, c.filed_by, c.assigned_to
    FROM complaints c
    JOIN complaint_categories cc ON c.category_id = cc.id
    WHERE c.id = ?
  `, [id]);

  if (rows.length === 0) {
    return Response.json({ error: 'Complaint not found' }, { status: 404 });
  }

  const row = rows[0];
  if (caller.role !== 'admin' && row.filed_by !== caller.id) {
    return Response.json({ error: 'Not allowed' }, { status: 403 });
  }

  let details: Record<string, any> = {};
  const session = getDriver().session();
  try {
    const res = await session.run(
      `MATCH (c:Complaint {refId: $refId})
       OPTIONAL MATCH (c)-[:AT_LOCATION]->(l:Location)
       RETURN c.description AS description, c.roomNumber AS roomNumber,
              c.issueType AS issueType, l.name AS location`,
      { refId: row.graph_ref_id }
    );
    if (res.records.length > 0) {
      const rec = res.records[0];
      details = {
        description: rec.get('description') ?? undefined,
        location: rec.get('location') ?? undefined,
        roomNumber: rec.get('roomNumber') ?? undefined,
        issueType: rec.get('issueType') ?? undefined
      };
    }
  } finally {
    await session.close();
  }

  return Response.json({
    id: row.id,
    status: row.status,
    category: row.category,
    isAnonymous: !!row.is_anonymous,
    filedBy: row.is_anonymous ? null : row.filed_by,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    ...details,
    comments: []
  });
}

// Finds the complaint and checks the caller may change it (owner or admin)
async function loadOwned(id: string, caller: { id: number; role: string }) {
  const [rows]: any = await getPool().query(
    `SELECT id, graph_ref_id, filed_by FROM complaints WHERE id = ?`, [id]);
  if (rows.length === 0)
    return { error: Response.json({ error: 'Complaint not found' }, { status: 404 }) };
  if (caller.role !== 'admin' && rows[0].filed_by !== caller.id)
    return { error: Response.json({ error: 'Not allowed' }, { status: 403 }) };
  return { row: rows[0] };
}

// ---------- UPDATE (Neo4j) ----------
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const caller = await getCaller(req);
  if (!caller) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { row, error } = await loadOwned(id, caller);
  if (error) return error;

  const { description, location, roomNumber, issueType } = await req.json();
  const props: Record<string, any> = {};
  if (description) props.description = description;
  if (roomNumber) props.roomNumber = roomNumber;
  if (issueType) props.issueType = issueType;
  const locationName = location ? String(location).trim().toLowerCase() : null;

  const session = getDriver().session();
  try {
    await session.run(
      `MATCH (c:Complaint {refId: $refId}) SET c += $props`,
      { refId: row.graph_ref_id, props }
    );
    if (locationName) {
      await session.run(
        `MATCH (c:Complaint {refId: $refId})
         OPTIONAL MATCH (c)-[r:AT_LOCATION]->(:Location)
         DELETE r
         WITH DISTINCT c
         MERGE (l:Location {name: $locationName})
         CREATE (c)-[:AT_LOCATION]->(l)`,
        { refId: row.graph_ref_id, locationName }
      );
    }
    // touch the MySQL row so the trigger refreshes last_updated
    await getPool().query(`UPDATE complaints SET status = status WHERE id = ?`, [id]);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Update failed:', err);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}

// ---------- DELETE (MySQL + Neo4j) ----------
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const caller = await getCaller(req);
  if (!caller) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { row, error } = await loadOwned(id, caller);
  if (error) return error;

  const session = getDriver().session();
  const conn = await getPool().getConnection();
  try {
    // Keep the MySQL delete uncommitted until the corresponding graph node
    // has also been deleted. If Neo4j fails, rollback preserves the SQL row.
    await conn.beginTransaction();
    const [result]: any = await conn.query(
      `DELETE FROM complaints WHERE id = ?`, [id]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return Response.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const graphCheck = await session.run(
      `MATCH (c:Complaint {refId: $refId}) RETURN count(c) AS existing`,
      { refId: row.graph_ref_id }
    );
    if (graphCheck.records[0].get('existing').toNumber() === 0) {
      throw new Error('Linked Neo4j complaint node was not found');
    }
    await session.run(
      `MATCH (c:Complaint {refId: $refId}) DETACH DELETE c`,
      { refId: row.graph_ref_id }
    );
    await conn.commit();
    return Response.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error('Delete failed; MySQL deletion rolled back:', err);
    return Response.json({ error: 'Delete failed; no SQL record was removed' }, { status: 500 });
  } finally {
    conn.release();
    await session.close();
  }
}
