'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const categoryMap: Record<string, number> = {
  lost_item: 1,
  found_item: 2,
  maintenance: 3,
  ragging: 4
};

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

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h1>File a Complaint</h1>
      <form onSubmit={handleSubmit}>
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}>
          <option value="lost_item">Lost Item</option>
          <option value="found_item">Found Item</option>
          <option value="maintenance">Maintenance</option>
          <option value="ragging">Ragging (Anonymous option available)</option>
        </select>

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />

        {['lost_item', 'found_item'].includes(category) && (
          <>
            <label>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
          </>
        )}

        {category === 'maintenance' && (
          <>
            <label>Room Number</label>
            <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
            <label>Issue Type</label>
            <input value={issueType} onChange={(e) => setIssueType(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
          </>
        )}

        {category === 'ragging' && (
          <label style={{ display: 'block', marginBottom: 10 }}>
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            {' '}File anonymously
          </label>
        )}

        {message && <p>{message}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
      </form>
    </div>
  );
}