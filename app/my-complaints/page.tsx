'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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

  if (status === 'loading') return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto' }}>
      <h1>My Complaints</h1>
      {complaints.length === 0 && <p>No complaints filed yet.</p>}
      {complaints.map((c) => (
        <div key={c.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 10 }}>
          <strong>{c.category}</strong> — {c.status}
          <p>{c.description}</p>
          {c.location && <p>Location: {c.location}</p>}
        </div>
      ))}
    </div>
  );
}