'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';

const categoryMap: Record<string, number> = {
  lost_item: 1,
  found_item: 2,
  maintenance: 3,
  ragging: 4
};

const categoryOptions = [
  { value: 'lost_item', icon: '🎒', label: 'Lost Item' },
  { value: 'found_item', icon: '🔎', label: 'Found Item' },
  { value: 'maintenance', icon: '🛠️', label: 'Maintenance' },
  { value: 'ragging', icon: '🛡️', label: 'Ragging' },
];

export default function FileComplaintPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [category, setCategory] = useState('lost_item');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [issueType, setIssueType] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
  if (category !== 'ragging') {
    setIsAnonymous(false);
  }
}, [category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const userId = (session?.user as any)?.id;

    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        categoryId: categoryMap[category],
        description,
        location: ['lost_item', 'found_item'].includes(category) ? location : undefined,
        roomNumber: category === 'maintenance' ? roomNumber : undefined,
        issueType: category === 'maintenance' ? issueType : undefined,
        isAnonymous,
        userId: isAnonymous ? undefined : Number(userId)
      })
    });

    if (res.ok) {
      setMessage('Complaint filed successfully.');
      setDescription('');
      setLocation('');
      setRoomNumber('');
      setIssueType('');
    } else {
      setMessage('Failed to file complaint.');
    }
  }

  const success = message.startsWith('Complaint filed');

  return (
    <AppShell title="File a Complaint" subtitle="Pick a category, add the details and send it." maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="cv-glass cv-rise space-y-6 rounded-3xl p-6 sm:p-8" style={{ ['--d' as string]: '0.1s' }}>
        <div>
          <span className="cv-label">Category</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categoryOptions.map((o) => {
              const active = category === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setCategory(o.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${
                    active
                      ? 'border-violet-400 bg-violet-500/20 text-white shadow-lg shadow-violet-500/25'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <span className="text-2xl">{o.icon}</span>
                  {o.label}
                </button>
              );
            })}
          </div>
          {category === 'ragging' && (
            <p className="mt-3 text-sm text-slate-400">Anonymous option available for ragging reports.</p>
          )}
        </div>

        <div>
          <label className="cv-label" htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required
            placeholder="What happened? Include details that help us act on it." className="cv-input" />
        </div>

        {['lost_item', 'found_item'].includes(category) && (
          <div>
            <label className="cv-label" htmlFor="location">Location</label>
            <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where was it?" className="cv-input" />
          </div>
        )}

        {category === 'maintenance' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="cv-label" htmlFor="room">Room Number</label>
              <input id="room" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. 214" className="cv-input" />
            </div>
            <div>
              <label className="cv-label" htmlFor="issue">Issue Type</label>
              <input id="issue" value={issueType} onChange={(e) => setIssueType(e.target.value)} placeholder="e.g. Plumbing" className="cv-input" />
            </div>
          </div>
        )}

        {category === 'ragging' && (
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-5 w-5 accent-violet-500" />
            File anonymously
          </label>
        )}

        {message && (
          <p role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            success ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-400/30 bg-rose-500/10 text-rose-300'
          }`}>
            {success ? '✅ ' : '⚠️ '}{message}
          </p>
        )}
        <button type="submit" className="cv-btn block" style={{ padding: '15px 26px', fontSize: 16 }}>
          Submit <span className="arrow">→</span>
        </button>
      </form>
    </AppShell>
  );
}
