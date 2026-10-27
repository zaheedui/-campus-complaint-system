import { NextRequest } from 'next/server';
import neo4j from 'neo4j-driver';
import { getPool } from '@/lib/mysql';
import { getDriver } from '@/lib/neo4j';

// Common words that would create false matches
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'near', 'from', 'was', 'were', 'has', 'have',
  'that', 'this', 'there', 'are', 'not', 'but', 'you', 'your', 'its', 'into',
  'around', 'behind', 'inside', 'outside'
]);

// Clean a description so special characters can't break the full-text query
function buildSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .join(' ');
}

const toNum = (v: any) => (neo4j.isInt(v) ? v.toNumber() : v);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pool = getPool();

  const [rows]: any = await pool.query(
    `SELECT c.graph_ref_id, cc.name AS category
     FROM complaints c
     JOIN complaint_categories cc ON c.category_id = cc.id
     WHERE c.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return Response.json({ error: 'Complaint not found' }, { status: 404 });
  }

  const { graph_ref_id: refId, category } = rows[0];

  if (!['lost_item', 'found_item'].includes(category)) {
    return Response.json({ error: 'Matching only applies to lost/found items' }, { status: 400 });
  }

  const oppositeCategory = category === 'lost_item' ? 'found_item' : 'lost_item';

  const session = getDriver().session();
  try {
    const src = await session.run(
      `MATCH (c:Complaint {refId: $refId}) RETURN c.description AS description`,
      { refId }
    );

    if (src.records.length === 0) {
      return Response.json({ error: 'No report details found for this complaint' }, { status: 404 });
    }

    const description: string = src.records[0].get('description');
    const searchText = buildSearchText(description);

    if (!searchText) {
      return Response.json({ searchedFor: description, matches: [] });
    }

    const res = await session.run(
      `MATCH (src:Complaint {refId: $refId})
       OPTIONAL MATCH (src)-[:AT_LOCATION]->(srcLoc:Location)
       CALL db.index.fulltext.queryNodes('complaint_text', $searchText) YIELD node, score
       WHERE node <> src
       MATCH (node)-[:IN_CATEGORY]->(:Category {name: $oppositeCategory})
       OPTIONAL MATCH (node)-[:AT_LOCATION]->(l:Location)
       WITH node, score, l, coalesce(l = srcLoc, false) AS sameLocation
       RETURN node.mysqlId AS id, node.description AS description, l.name AS location,
              sameLocation,
              score + CASE WHEN sameLocation THEN 1.0 ELSE 0.0 END AS finalScore
       ORDER BY finalScore DESC
       LIMIT 5`,
      { refId, searchText, oppositeCategory }
    );

    const matches = res.records.map((rec) => ({
      id: toNum(rec.get('id')),
      description: rec.get('description'),
      location: rec.get('location') ?? undefined,
      sameLocation: rec.get('sameLocation'),
      score: rec.get('finalScore')
    }));

    return Response.json({ searchedFor: description, matches });
  } catch (err) {
    console.error('Matching failed:', err);
    return Response.json({ error: 'Matching failed' }, { status: 500 });
  } finally {
    await session.close();
  }
}