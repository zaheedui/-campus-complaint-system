'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/AuthShell';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const router = useRouter();
     const [adminCode, setAdminCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, adminCode })
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Signup failed');
    }
  }

  return (
    <AuthShell
      title="Join CampusVoice"
      subtitle="Create an account to start filing complaints."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-cyan-300 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="cv-label" htmlFor="name">Name</label>
          <input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="cv-input" />
        </div>
        <div>
          <label className="cv-label" htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="cv-input" />
        </div>
        <div>
          <label className="cv-label" htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} className="cv-input" />
        </div>
        <div>
          <label className="cv-label" htmlFor="role">I am a</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="cv-input">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {role === 'admin' && (
          <div>
            <label className="cv-label" htmlFor="adminCode">Admin access code</label>
            <input id="adminCode" type="password" placeholder="Admin access code" value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)} className="cv-input" />
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
            {error}
          </p>
        )}
        <button type="submit" className="cv-btn block" style={{ marginTop: 8, padding: '15px 26px', fontSize: 16 }}>
          Sign Up <span className="arrow">→</span>
        </button>
      </form>
    </AuthShell>
  );
}
