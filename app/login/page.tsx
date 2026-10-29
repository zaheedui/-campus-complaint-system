'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/AuthShell';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to file and track your complaints."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-cyan-300 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="cv-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cv-input"
          />
        </div>
        <div>
          <label className="cv-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cv-input"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
            {error}
          </p>
        )}
        <button type="submit" className="cv-btn block" style={{ marginTop: 8, padding: '15px 26px', fontSize: 16 }}>
          Log In <span className="arrow">→</span>
        </button>
      </form>
    </AuthShell>
  );
}
