'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { categoryIcon, labelize, statusStyle } from '@/components/complaintStyle';

export default function AdminPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/summary').then(res => res.json()).then(setSummary);
    fetch('/api/complaints').then(res => res.json()).then(setComplaints);
  }, []);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await fetch('/api/complaints').then(r => r.json());
      setComplaints(updated);
    }
  }

  async function checkMatches(id: number) {
    const res = await fetch(`/api/complaints/${id}/matches`);
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <AppShell title="Admin Dashboard" subtitle="Review every complaint and move it forward." maxWidth="max-w-5xl">
      <h2 className="mb-4 font-display text-xl font-bold text-white">Open Complaints Summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s: any, i) => (
          <div key={s.category} className="cv-glass cv-rise rounded-3xl p-5" style={{ ['--d' as string]: `${i * 0.08}s` }}>
            <span className="text-2xl">{categoryIcon(s.category)}</span>
            <p className="mt-3 font-display text-4xl font-extrabold text-white">{s.open_count}</p>
            <p className="text-sm text-slate-400">{labelize(s.category)}: open</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-12 font-display text-xl font-bold text-white">All Complaints</h2>
      <div className="space-y-4">
        {complaints.map((c: any) => (
          <div key={c.id} className="cv-glass rounded-3xl p-6 transition hover:border-white/25">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">{categoryIcon(c.category)}</span>
                <strong className="font-display text-lg text-white">#{c.id} — {labelize(c.category)}</strong>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(c.status)}`}>
                <span className="cv-dot" /> {labelize(c.status)}
              </span>
            </div>
            <p className="mt-4 leading-7 text-slate-300">{c.description}</p>
            {c.location && <p className="mt-3 text-sm text-slate-400">📍 Location: {c.location}</p>}
            <p className="mt-1 text-sm text-slate-400">Filed by: {c.isAnonymous ? 'Anonymous' : c.filedBy || 'N/A'}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <select onChange={(e) => updateStatus(c.id, e.target.value)} defaultValue="" className="cv-input" style={{ width: 'auto', minWidth: 180, padding: '10px 14px' }}>
                <option value="" disabled>Change status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {['lost_item', 'found_item'].includes(c.category) && (
                <button onClick={() => checkMatches(c.id)} className="cv-btn-ghost sm">
                  🔗 Check Matches
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
