import Link from 'next/link';

export default function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg shadow-lg shadow-violet-500/40">
        📣
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-white">
        Campus<span className="text-cyan-300">Voice</span>
      </span>
    </Link>
  );
}
