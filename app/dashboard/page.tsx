'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Aurora from '@/components/Aurora';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading')
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4">
        <Aurora />
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" />
        <p className="text-sm font-medium text-slate-400">Loading...</p>
      </div>
    );
  if (!session) return null;

  const role = (session.user as any).role;
  const name = String(session.user?.name || '?');

  const tiles = [
    { href: '/file-complaint', icon: '📝', title: 'File Complaint', text: 'Report a lost item, found item, maintenance issue or ragging.', tone: 'from-violet-500 to-indigo-500', glow: 'hover:shadow-violet-500/30' },
    { href: '/my-complaints', icon: '📂', title: 'My Complaints', text: 'Check the status of everything you have filed.', tone: 'from-cyan-400 to-sky-500', glow: 'hover:shadow-cyan-500/30' },
    ...(role === 'admin'
      ? [{ href: '/admin', icon: '🧰', title: 'Admin Panel', text: 'Manage all complaints, update statuses and find matches.', tone: 'from-rose-500 to-orange-400', glow: 'hover:shadow-rose-500/30' }]
      : []),
  ];

  return (
    <AppShell>
      <section className="cv-glass cv-rise relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-400 font-display text-4xl font-black text-white shadow-xl shadow-violet-500/40">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-200">Good to see you</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Welcome, {session.user?.name}</h1>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-sm font-semibold text-white">
              <span className="cv-dot text-emerald-400" /> Role: {role}
            </p>
          </div>
        </div>
        <p className="relative mt-7 max-w-xl text-slate-300">
          {role === 'admin' ? (
            <>Admin view — complaint management tools go here.</>
          ) : (
            <>Student view — file a complaint or check your existing ones.</>
          )}
        </p>
      </section>

      <h2 className="mb-4 mt-12 font-display text-xl font-bold text-white">Quick actions</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t, i) => (
          <Link
            key={t.href}
            href={t.href}
            style={{ ['--d' as string]: `${0.15 + i * 0.1}s` }}
            className={`cv-glass cv-rise group rounded-3xl p-6 transition duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-2xl ${t.glow}`}
          >
            <span className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg transition group-hover:scale-110 group-hover:rotate-6 ${t.tone}`}>
              {t.icon}
            </span>
            <h3 className="flex items-center justify-between text-lg font-bold text-white">
              {t.title}
              <span className="text-cyan-300 transition group-hover:translate-x-1.5">→</span>
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{t.text}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
