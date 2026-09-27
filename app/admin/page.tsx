'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

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
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h1>Admin Dashboard</h1>
      <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ marginBottom: 20, padding: '8px 16px' }}>
        Log Out
      </button>

      <h2>Open Complaints Summary</h2>
      <ul>
        {summary.map((s: any) => (
          <li key={s.category}>{s.category}: {s.open_count} open</li>
        ))}
      </ul>

      <h2>All Complaints</h2>
      {complaints.map((c: any) => (
        <div key={c.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 10 }}>
          <strong>#{c.id} — {c.category}</strong> ({c.status})
          <p>{c.description}</p>
          {c.location && <p>Location: {c.location}</p>}
          <p>Filed by: {c.isAnonymous ? 'Anonymous' : c.filedBy || 'N/A'}</p>

          <select onChange={(e) => updateStatus(c.id, e.target.value)} defaultValue="">
            <option value="" disabled>Change status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {['lost_item', 'found_item'].includes(c.category) && (
            <button onClick={() => checkMatches(c.id)} style={{ marginLeft: 10 }}>
              Check Matches
            </button>
          )}
        </div>
      ))}
    </div>
  );
}