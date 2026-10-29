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

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (userId) {
      fetch(`/api/complaints?userId=${userId}`)
        .then(res => res.json())
        .then(setComplaints);
    }
  }, [session]);

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
            <p className="mt-4 leading-7 text-slate-300">{c.description}</p>
            {c.location && <p className="mt-3 text-sm text-slate-400">📍 Location: {c.location}</p>}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
