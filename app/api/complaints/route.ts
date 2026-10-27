import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import neo4j from 'neo4j-driver';
import { getPool } from '@/lib/mysql';
import { getDriver } from '@/lib/neo4j';
import { getCaller } from '@/lib/authz';


export async function POST(req: NextRequest) {
  const caller = await getCaller(req);
  if (!caller) return Response.json({ error: 'Not logged in' }, { status: 401 });

  const body = await req.json();
  const { category, description, location, roomNumber, issueType, isAnonymous, categoryId } = body;

  const refId = randomUUID();

  // Only include optional fields that were actually provided
  const props: Record<string, any> = { refId, description, isAnonymous: !!isAnonymous };
  if (roomNumber) props.roomNumber = roomNumber;
  if (issueType) props.issueType = issueType;
  const locationName = location ? String(location).trim().toLowerCase() : null;

  const session = getDriver().session();

  try {
    // Step 1: create the report as a node in Neo4j, linked to its category and location
    const created = await session.run(
      `MATCH (cat:Category {name: $category})
       CREATE (c:Complaint)
       SET c += $props, c.createdAt = datetime()
       CREATE (c)-[:IN_CATEGORY]->(cat)
       WITH c
       FOREACH (_ IN CASE WHEN $locationName IS NULL THEN [] ELSE [1] END |
         MERGE (l:Location {name: $locationName})
         CREATE (c)-[:AT_LOCATION]->(l))
       RETURN c.refId AS refId`,
      { category, props, locationName }
    );

    if (created.records.length === 0) {
      return Response.json({ error: 'Unknown category' }, { status: 400 });
    }

    // Step 2: create the workflow row in MySQL
    const pool = getPool();
    try {
      const [result]: any = await pool.query(
        `INSERT INTO complaints (graph_ref_id, category_id, filed_by, is_anonymous, status)
         VALUES (?, ?, ?, ?, 'open')`,
        [refId, categoryId, isAnonymous ? null : caller.id, !!isAnonymous]
      );

      // Link back: store the MySQL id on the Neo4j node
      await session.run(
        `MATCH (c:Complaint {refId: $refId}) SET c.mysqlId = $mysqlId`,
        { refId, mysqlId: neo4j.int(result.insertId) }
      );

      return Response.json({ complaintId: result.insertId, refId }, { status: 201 });
    } catch (err) {
      // Compensating rollback: MySQL failed, so remove the Neo4j node
      await session.run(`MATCH (c:Complaint {refId: $refId}) DETACH DELETE c`, { refId });
      console.error('Complaint creation failed, rolled back Neo4j node:', err);
      return Response.json({ error: 'Failed to file complaint' }, { status: 500 });
    }
  } catch (err) {
    console.error('Neo4j write failed:', err);
    return Response.json({ error: 'Failed to file complaint' }, { status: 500 });
  } finally {
    await session.close();
  }
}

export async function GET(req: NextRequest) {
  const pool = getPool();
  const caller = await getCaller(req);
   if (!caller) return Response.json({ error: 'Not logged in' }, { status: 401 });

  const { searchParams } = new URL(req.url);
     // Students only ever see their own complaints; admins see all, or filter by user
   const userId = caller.role === 'admin' ? searchParams.get('userId') : String(caller.id);

  let query = `
    SELECT c.id, c.graph_ref_id, c.status, c.is_anonymous, c.created_at,
           cc.name AS category, c.filed_by, c.assigned_to
    FROM complaints c
    JOIN complaint_categories cc ON c.category_id = cc.id
  `;
  const queryParams: any[] = [];

  if (userId) {
    query += ` WHERE c.filed_by = ?`;
    queryParams.push(userId);
  }

  query += ` ORDER BY c.created_at DESC`;

  const [rows]: any = await pool.query(query, queryParams);

  // One Neo4j query fetches the report details for every complaint in the list
  const details = new Map<string, { description?: string; location?: string }>();
  const refIds = rows.map((r: any) => r.graph_ref_id);

  if (refIds.length > 0) {
    const session = getDriver().session();
    try {
      const res = await session.run(
        `MATCH (c:Complaint) WHERE c.refId IN $refIds
         OPTIONAL MATCH (c)-[:AT_LOCATION]->(l:Location)
         RETURN c.refId AS refId, c.description AS description, l.name AS location`,
        { refIds }
      );
      res.records.forEach((rec) => {
        details.set(rec.get('refId'), {
          description: rec.get('description'),
          location: rec.get('location') ?? undefined
        });
      });
    } finally {
      await session.close();
    }
  }

  const enriched = rows.map((row: any) => {
    const d = details.get(row.graph_ref_id);
    return {
      id: row.id,
      status: row.status,
      category: row.category,
      isAnonymous: !!row.is_anonymous,
      filedBy: row.is_anonymous ? null : row.filed_by,
      assignedTo: row.assigned_to,
      createdAt: row.created_at,
      description: d?.description,
      location: d?.location,
      comments: []
    };
  });

  return Response.json(enriched);
}