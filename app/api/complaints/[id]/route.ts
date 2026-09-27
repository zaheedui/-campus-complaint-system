import { NextRequest } from 'next/server';
import { getPool } from '@/lib/mysql';
import { connectMongo } from '@/lib/mongo';
import ComplaintReport from '@/models/ComplaintReport';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const pool = getPool();
  await connectMongo();

  const [rows]: any = await pool.query(`
    SELECT c.id, c.mongo_ref_id, c.status, c.is_anonymous, c.created_at,
           cc.name AS category, c.filed_by, c.assigned_to
    FROM complaints c
    JOIN complaint_categories cc ON c.category_id = cc.id
    WHERE c.id = ?
  `, [(await params).id]);

  if (rows.length === 0) {
    return Response.json({ error: 'Complaint not found' }, { status: 404 });
  }

  const row = rows[0];
  const mongoDoc = await ComplaintReport.findById(row.mongo_ref_id).lean();

  return Response.json({
    id: row.id,
    status: row.status,
    category: row.category,
    isAnonymous: !!row.is_anonymous,
    filedBy: row.is_anonymous ? null : row.filed_by,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    description: mongoDoc?.description,
    location: mongoDoc?.location,
    roomNumber: mongoDoc?.roomNumber,
    issueType: mongoDoc?.issueType,
    comments: mongoDoc?.comments || []
  });
}


