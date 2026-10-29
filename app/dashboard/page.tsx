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

  if (status === 'loading')
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ background: '#f8fafc' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    );
  if (!session) return null;

  const role = (session.user as any).role;
  const name = String(session.user?.name || '?');

  const tiles = [
    { href: '/file-complaint', icon: '📝', title: 'File Complaint', text: 'Report a lost item, found item, maintenance issue or ragging.', tone: 'from-indigo-500 to-violet-600' },
    { href: '/my-complaints', icon: '📂', title: 'My Complaints', text: 'Check the status of everything you have filed.', tone: 'from-sky-500 to-cyan-500' },
    ...(role === 'admin'
      ? [{ href: '/admin', icon: '🧰', title: 'Admin Panel', text: 'Manage all complaints, update statuses and find matches.', tone: 'from-rose-500 to-orange-500' }]
      : []),
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(1000px 520px at 8% -10%, rgba(99,102,241,.2), transparent 60%), radial-gradient(900px 520px at 100% 0%, rgba(14,165,233,.17), transparent 55%), radial-gradient(900px 600px at 50% 115%, rgba(168,85,247,.15), transparent 60%), #f8fafc',
      }}
    >
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a href="/dashboard" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-lg shadow-indigo-500/30">📣</span>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Campus<span className="text-indigo-600">Voice</span>
            </span>
          </a>
          <nav className="flex items-center gap-1 overflow-x-auto">
            <a href="/dashboard" className="whitespace-nowrap rounded-xl bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700">Dashboard</a>
            <a href="/file-complaint" className="whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">File Complaint</a>
            <a href="/my-complaints" className="whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">My Complaints</a>
            {role === 'admin' && (
              <a href="/admin" className="whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Admin Panel</a>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-600 p-8 text-white shadow-2xl shadow-indigo-500/30 sm:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black backdrop-blur">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-100">Good to see you</p>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome, {session.user?.name}</h1>
                <p className="mt-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                  Role: {role}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                color: '#ffffff',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 12,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Log Out
            </button>
          </div>
          <p className="relative mt-6 max-w-xl text-indigo-50">
            {role === 'admin' ? (
              <>Admin view — complaint management tools go here.</>
            ) : (
              <>Student view — file a complaint or check your existing ones.</>
            )}
          </p>
        </section>

        <h2 className="mb-4 mt-10 text-lg font-bold text-slate-900">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="group rounded-[1.25rem] border border-slate-200 bg-white/85 p-6 shadow-lg shadow-indigo-500/5 backdrop-blur transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/15"
            >
              <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg ${t.tone}`}>
                {t.icon}
              </span>
              <h3 className="flex items-center justify-between text-lg font-bold text-slate-900">
                {t.title}
                <span className="text-indigo-500 transition group-hover:translate-x-1">→</span>
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{t.text}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}