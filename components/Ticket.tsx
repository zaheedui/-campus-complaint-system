type TicketProps = {
  icon: string;
  title: string;
  meta: string;
  status: string;
  pin: string;
  rotate: number;
  delay: number;
  className?: string;
};

export default function Ticket({ icon, title, meta, status, pin, rotate, delay, className = '' }: TicketProps) {
  return (
    <div
      className={`cv-ticket cv-glass absolute ${className}`}
      style={{ ['--pin' as string]: pin, ['--r' as string]: `${rotate}deg`, ['--d' as string]: `${delay}s` }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">{icon}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{title}</p>
          <p className="truncate text-xs text-slate-400">{meta}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold" style={{ color: pin }}>
            <span className="cv-dot" /> {status}
          </p>
        </div>
      </div>
    </div>
  );
}
