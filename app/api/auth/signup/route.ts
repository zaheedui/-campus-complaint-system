import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { getPool } from '@/lib/mysql';

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  const roleId = role === 'admin' ? 2 : 1;
  const passwordHash = await bcrypt.hash(password, 10);

  const pool = getPool();
  try {
    const [result]: any = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)`,
      [name, email, passwordHash, roleId]
    );
    return Response.json({ userId: result.insertId }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }
    console.error('Signup failed:', err);
    return Response.json({ error: 'Signup failed' }, { status: 500 });
  }
}