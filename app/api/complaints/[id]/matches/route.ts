import { NextRequest } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import ComplaintReport from '@/models/ComplaintReport';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectMongo();

  const report = await ComplaintReport.findOne({ postgresComplaintId: Number(id) });

  if (!report) {
    return Response.json({ error: 'Complaint not found' }, { status: 404 });
  }

  if (!['lost_item', 'found_item'].includes(report.category)) {
    return Response.json({ error: 'Matching only applies to lost/found items' }, { status: 400 });
  }

  const oppositeCategory = report.category === 'lost_item' ? 'found_item' : 'lost_item';

  const matches = await ComplaintReport.find(
    {
      category: oppositeCategory,
      $text: { $search: report.description }
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5)
    .lean();

  return Response.json({
    searchedFor: report.description,
    matches: matches.map((m: any) => ({
      id: m.postgresComplaintId,
      description: m.description,
      location: m.location,
      score: m.score
    }))
  });
}