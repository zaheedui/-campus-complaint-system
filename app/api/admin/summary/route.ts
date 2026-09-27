import { getPool } from '@/lib/mysql';

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM open_complaints_summary');
  return Response.json(rows);
}