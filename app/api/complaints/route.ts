import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import neo4j from 'neo4j-driver';
import { getPool } from '@/lib/mysql';
import { getDriver } from '@/lib/neo4j';
import { connectMongo } from '@/lib/mongo';
import ComplaintReport from '@/models/ComplaintReport';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, description, location, roomNumber, issueType, isAnonymous, userId, categoryId } = body;

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
        `INSERT INTO complaints (mongo_ref_id, category_id, filed_by, is_anonymous, status)
         VALUES (?, ?, ?, ?, 'open')`,
        [refId, categoryId, isAnonymous ? null : userId, !!isAnonymous]
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
  await connectMongo();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  let query = `
    SELECT c.id, c.mongo_ref_id, c.status, c.is_anonymous, c.created_at,
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

  const enriched = await Promise.all(
    rows.map(async (row: any) => {
      const mongoDoc = await ComplaintReport.findById(row.mongo_ref_id).lean();
      return {
        id: row.id,
        status: row.status,
        category: row.category,
        isAnonymous: !!row.is_anonymous,
        filedBy: row.is_anonymous ? null : row.filed_by,
        assignedTo: row.assigned_to,
        createdAt: row.created_at,
        description: mongoDoc?.description,
        location: mongoDoc?.location,
        comments: mongoDoc?.comments || []
      };
    })
  );

  return Response.json(enriched);
}