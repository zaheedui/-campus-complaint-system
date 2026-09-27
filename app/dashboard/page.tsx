'use client';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return null;

  const role = (session.user as any).role;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h1>Welcome, {session.user?.name}</h1>
      <p>Role: {role}</p>
      {role === 'admin' ? (
        <p>Admin view — complaint management tools go here.</p>
      ) : (
        <p>Student view — file a complaint or check your existing ones.</p>
      )}
      <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ marginTop: 20, padding: '8px 16px' }}>
        Log Out
      </button>
    </div>
  );
}