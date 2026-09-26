import { NextRequest } from 'next/server';
import { getPool } from '@/lib/mysql';
import { connectMongo } from '@/lib/mongo';
import ComplaintReport from '@/models/ComplaintReport';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, description, location, roomNumber, issueType, isAnonymous, userId, categoryId } = body;

  await connectMongo();

  // Step 1: create the flexible report in MongoDB first
  const mongoDoc = await ComplaintReport.create({
    category,
    description,
    location,
    roomNumber,
    issueType,
    isAnonymous: !!isAnonymous,
    ...(isAnonymous ? {} : { filedByUserId: userId }) // omit entirely if anonymous
  });

  // Step 2: create the workflow record in MySQL, referencing the Mongo doc
  const pool = getPool();
  try {
    const [result]: any = await pool.query(
      `INSERT INTO complaints (mongo_ref_id, category_id, filed_by, is_anonymous, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [mongoDoc._id.toString(), categoryId, isAnonymous ? null : userId, !!isAnonymous]
    );

    // link back: store the MySQL id on the Mongo doc too, for easy lookup later
    mongoDoc.postgresComplaintId = result.insertId;
    await mongoDoc.save();

    return Response.json({ complaintId: result.insertId, mongoId: mongoDoc._id }, { status: 201 });

  } catch (err) {
    // Compensating rollback: MySQL failed, so undo the Mongo write
    await ComplaintReport.findByIdAndDelete(mongoDoc._id);
    console.error('Complaint creation failed, rolled back Mongo doc:', err);
    return Response.json({ error: 'Failed to file complaint' }, { status: 500 });
  }
}