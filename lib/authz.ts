import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export type Caller = { id: number; role: 'student' | 'admin' };

// Returns the logged-in user, or null if there is no valid session
export async function getCaller(req: NextRequest): Promise<Caller | null> {
  const token = await getToken({ req });
  if (!token || !token.id) return null;
  return { id: Number(token.id), role: token.role === 'admin' ? 'admin' : 'student' };
}