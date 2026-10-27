import { NextRequest } from 'next/server';
import { getPool } from '@/lib/mysql';
import { getCaller } from '@/lib/authz';

export async function GET(req: NextRequest) {
  const caller = await getCaller(req);
  if (!caller) return Response.json({ error: 'Not logged in' }, { status: 401 });
  if (caller.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM open_complaints_summary');
  return Response.json(rows);
}