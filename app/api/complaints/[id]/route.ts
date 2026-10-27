import { NextRequest } from 'next/server';
import { getPool } from '@/lib/mysql';
import { getDriver } from '@/lib/neo4j';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  // Fetch this complaint's report details from Neo4j
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