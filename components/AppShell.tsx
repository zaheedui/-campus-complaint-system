'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Aurora from './Aurora';
import Brand from './Brand';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
};

export default function AppShell({ children, title, subtitle, maxWidth = 'max-w-6xl' }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role;

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/file-complaint', label: 'File Complaint' },
    { href: '/my-complaints', label: 'My Complaints' },
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin Panel' }] : []),
  ];

  return (
    <div className="relative min-h-screen">
      <Aurora />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070918]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Brand href="/dashboard" />
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    active ? 'bg-white/12 text-white shadow-inner shadow-white/10' : 'text-slate-400 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="cv-btn-ghost sm shrink-0">
            Log Out
          </button>
        </div>
      </header>

      <main className={`mx-auto w-full ${maxWidth} px-5 py-10`}>
        {title && (
          <div className="cv-rise mb-8">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
