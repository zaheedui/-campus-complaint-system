import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { getPool } from '@/lib/mysql';

export async function POST(req: NextRequest) {
     const { name, email, password, role, adminCode } = await req.json();

  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password || !role) {
    return Response.json({ error: 'Name, email, password and role are required' }, { status: 400 });
  }
  if (!['student', 'admin'].includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
     if (role === 'admin' && (!process.env.ADMIN_SIGNUP_CODE || adminCode !== process.env.ADMIN_SIGNUP_CODE)) {
     return Response.json({ error: 'Invalid admin code' }, { status: 403 });
   }

  const pool = getPool();
  const [roleRows]: any = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
  if (roleRows.length === 0) {
    return Response.json({ error: 'Configured account role is missing from the database' }, { status: 500 });
  }
  const roleId = roleRows[0].id;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [result]: any = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)`,
      [String(name).trim(), normalizedEmail, passwordHash, roleId]
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