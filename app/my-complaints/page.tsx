'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Aurora from '@/components/Aurora';
import { categoryIcon, labelize, statusStyle } from '@/components/complaintStyle';

export default function MyComplaintsPage() {
  const { data: session, status } = useSession();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    const userId = (session?.user as any)?.id;
    if (userId) {
      fetch(`/api/complaints?userId=${userId}`)
        .then(res => res.json())
        .then(setComplaints);
    }
  };

  useEffect(load, [session]);

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditDesc(c.description ?? '');
    setEditLoc(c.location ?? '');
    setMessage('');
  };

  const saveEdit = async (id: number) => {
    const res = await fetch(`/api/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: editDesc, location: editLoc })
    });
    if (res.ok) {
      setEditingId(null);
      setMessage('Complaint updated.');
      load();
    } else {
      setMessage('Update failed.');
    }
  };

  const deleteComplaint = async (id: number) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Complaint deleted.');
      load();
    } else {
      setMessage('Delete failed.');
    }
  };

  if (status === 'loading')
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4">
        <Aurora />
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" />
        <p className="text-sm font-medium text-slate-400">Loading...</p>
      </div>
    );

  return (
    <AppShell title="My Complaints" subtitle="Everything you have filed, and where it stands." maxWidth="max-w-3xl">
      {message && <p className="mb-4 text-sm font-semibold text-cyan-300">{message}</p>}
      {complaints.length === 0 && (
        <div className="cv-glass cv-rise rounded-3xl p-10 text-center">
          <p className="text-5xl">📭</p>
          <p className="mt-4 text-lg font-bold text-white">No complaints filed yet.</p>
          <p className="mt-1 text-slate-400">When you file one, it shows up here with its status.</p>
          <Link href="/file-complaint" className="cv-btn mt-6">File a complaint <span className="arrow">→</span></Link>
        </div>
      )}
      <div className="space-y-4">
        {complaints.map((c, i) => (
          <div
            key={c.id}
            className="cv-glass cv-rise rounded-3xl p-6 transition hover:-translate-y-1 hover:border-white/25"
            style={{ ['--d' as string]: `${Math.min(i, 8) * 0.06}s` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">{categoryIcon(c.category)}</span>
                <strong className="font-display text-lg text-white">{labelize(c.category)}</strong>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(c.status)}`}>
                <span className="cv-dot" /> {labelize(c.status)}
              </span>
            </div>

            {editingId === c.id ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-slate-200"
                />
                <input
                  value={editLoc}
                  onChange={e => setEditLoc(e.target.value)}
                  placeholder="Location"
                  className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-slate-200"
                />
                <div className="flex gap-3">
                  <button onClick={() => saveEdit(c.id)} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-900">Save</button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-300">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-4 leading-7 text-slate-300">{c.description}</p>
                {c.location && <p className="mt-3 text-sm text-slate-400">📍 Location: {c.location}</p>}
                <div className="mt-4 flex gap-3">
                  <button onClick={() => startEdit(c)} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">✏️ Edit</button>
                  <button onClick={() => deleteComplaint(c.id)} className="rounded-lg border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-400/10">🗑 Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
