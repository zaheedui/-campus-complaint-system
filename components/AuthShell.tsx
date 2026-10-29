import Link from 'next/link';
import Aurora from './Aurora';
import Brand from './Brand';
import Ticket from './Ticket';

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora />
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.1fr_1fr]">
        {/* Left: brand + live notice board */}
        <section className="relative hidden flex-col justify-between px-10 py-10 lg:flex">
          <Brand />
          <div className="relative">
            <h2 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
              <span className="cv-gradient-text">Report it.</span>
              <br />
              <span className="cv-gradient-text">Track it.</span>
              <br />
              <span className="cv-gradient-text">See it fixed.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-7 text-slate-300">
              Lost items, broken fans, serious concerns. One place on campus where every complaint gets an owner and a status.
            </p>
            <div className="relative mt-12 h-[23rem] max-w-lg">
              <Ticket icon="🎒" title="Lost: black backpack" meta="Library, 2nd floor" status="Match found" pin="#34d399" rotate={-3} delay={0.2} className="absolute left-0 top-0 w-64" />
              <Ticket icon="🛠️" title="Room 214: ceiling fan" meta="Maintenance" status="In progress" pin="#fbbf24" rotate={2.5} delay={0.45} className="absolute right-0 top-32 w-64" />
              <Ticket icon="🛡️" title="Anonymous report" meta="Identity hidden" status="Assigned to admin" pin="#fb7185" rotate={-1.5} delay={0.7} className="absolute bottom-0 left-10 w-64" />
            </div>
          </div>
          <p className="text-sm text-slate-500">Campus Complaint Management System</p>
        </section>

        {/* Right: form */}
        <section className="flex flex-col justify-center px-5 py-10 sm:px-10">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <div className="cv-glass cv-rise mx-auto w-full max-w-md rounded-3xl p-7 sm:p-9" style={{ ['--d' as string]: '0.1s' }}>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">{title}</h1>
            <p className="mt-2 text-slate-400">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">{footer}</div>
          </div>
          <Link href="/" className="mx-auto mt-6 text-sm text-slate-500 transition hover:text-slate-300">
            ← Back to home
          </Link>
        </section>
      </div>
    </div>
  );
}
