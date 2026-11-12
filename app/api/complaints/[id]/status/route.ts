import { NextRequest } from 'next/server';
import { getPool } from '@/lib/mysql';
import { getCaller } from '@/lib/authz';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await getCaller(req);
   if (!caller) return Response.json({ error: 'Not logged in' }, { status: 401 });
   if (caller.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });
  const { status, assignedTo } = await req.json();

  const validStatuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (assignedTo !== undefined && assignedTo !== null && !Number.isInteger(Number(assignedTo))) {
    return Response.json({ error: 'Assignee id must be an integer' }, { status: 400 });
  }

  if (assignedTo !== undefined && assignedTo !== null) {
    const [admins]: any = await getPool().query(
      `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? AND r.name = 'admin'`, [assignedTo]
    );
    if (admins.length === 0) {
      return Response.json({ error: 'Assignee must be an existing admin' }, { status: 400 });
    }
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const updateSql = assignedTo === undefined
      ? `UPDATE complaints SET status = ? WHERE id = ?`
      : `UPDATE complaints SET status = ?, assigned_to = ? WHERE id = ?`;
    const updateParams = assignedTo === undefined
      ? [status, id]
      : [status, assignedTo, id];
    const [updateResult]: any = await conn.query(updateSql, updateParams);
    if (updateResult.affectedRows === 0) {
      const [existing]: any = await conn.query('SELECT id FROM complaints WHERE id = ?', [id]);
      if (existing.length === 0) throw new Error('Complaint not found');
    }

    // Example of a second related write inside the same transaction —
    // here just re-affirming the row exists, but this is where you'd
    // add e.g. an audit log insert later if you want a 5th advanced feature
    const [check]: any = await conn.query(`SELECT id FROM complaints WHERE id = ?`, [id]);
    if (check.length === 0) {
      throw new Error('Complaint not found during transaction');
    }

    await conn.commit();
    return Response.json({ success: true, id, status, assignedTo });

  } catch (err) {
    await conn.rollback();
    console.error('Status update transaction failed:', err);
    return Response.json({ error: 'Failed to update status' }, { status: 500 });
  } finally {
    conn.release();
  }
}