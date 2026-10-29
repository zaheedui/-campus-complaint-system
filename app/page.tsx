import Link from 'next/link';
import Aurora from '@/components/Aurora';
import Brand from '@/components/Brand';
import Ticket from '@/components/Ticket';

const categories = [
  { icon: '🎒', title: 'Lost items', text: 'Describe what you lost and where. We look for matching found items.', tone: 'from-violet-500/30' },
  { icon: '🔎', title: 'Found items', text: 'Handed in something? Log it so its owner can find it.', tone: 'from-cyan-500/30' },
  { icon: '🛠️', title: 'Maintenance', text: 'Report a room or hostel problem and follow the repair.', tone: 'from-amber-500/30' },
  { icon: '🛡️', title: 'Ragging', text: 'Report seriously, and anonymously if you need to.', tone: 'from-rose-500/30' },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <div className="flex items-center gap-3">
          <Link href="/login" className="cv-btn-ghost sm">Log in</Link>
          <Link href="/signup" className="cv-btn" style={{ padding: '10px 20px' }}>Sign up</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-8">
        <section className="grid items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
          <div>
            <p className="cv-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-cyan-200" style={{ ['--d' as string]: '0s' }}>
              <span className="cv-dot text-emerald-400" /> Built for students and campus admins
            </p>
            <h1 className="cv-rise mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl" style={{ ['--d' as string]: '0.1s' }}>
              <span className="cv-gradient-text">Your campus has a voice.</span>
              <br />
              <span className="text-white">Use it.</span>
            </h1>
            <p className="cv-rise mt-6 max-w-xl text-lg leading-8 text-slate-300" style={{ ['--d' as string]: '0.2s' }}>
              File a complaint in under a minute, then watch it move from open to resolved. Lost something, found something, or something broken. It all lands with the right person.
            </p>
            <div className="cv-rise mt-9 flex flex-wrap items-center gap-4" style={{ ['--d' as string]: '0.3s' }}>
              <Link href="/login" className="cv-btn" style={{ padding: '16px 34px', fontSize: 16 }}>
                Log in <span className="arrow">→</span>
              </Link>
              <Link href="/signup" className="cv-btn-ghost" style={{ padding: '15px 28px', fontSize: 16 }}>
                Create an account
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-[28rem] w-full max-w-md" aria-hidden="true">
            <Ticket icon="🎒" title="Lost: black backpack" meta="Library, 2nd floor" status="Match found" pin="#34d399" rotate={-4} delay={0.4} className="absolute left-0 top-0 w-72" />
            <Ticket icon="🛠️" title="Room 214: ceiling fan" meta="Maintenance" status="In progress" pin="#fbbf24" rotate={3} delay={0.65} className="absolute right-0 top-36 w-72" />
            <Ticket icon="🔎" title="Found: silver water bottle" meta="Canteen" status="Open" pin="#22d3ee" rotate={-2} delay={0.9} className="absolute bottom-0 left-8 w-72" />
          </div>
        </section>

        <section className="pb-24">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white">What can you report?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <div key={c.title} className={`cv-glass rounded-3xl bg-gradient-to-b ${c.tone} to-transparent p-6 transition hover:-translate-y-1.5`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{c.icon}</span>
                <h3 className="mt-5 text-lg font-bold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
