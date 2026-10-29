// Display-only helpers: icons, labels and status colours. No data logic.
export function labelize(value: unknown): string {
  const s = String(value ?? '').replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function categoryIcon(category: string): string {
  switch (category) {
    case 'lost_item': return '🎒';
    case 'found_item': return '🔎';
    case 'maintenance': return '🛠️';
    case 'ragging': return '🛡️';
    default: return '📝';
  }
}

export function statusStyle(status: string): string {
  switch (status) {
    case 'open': return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300';
    case 'assigned': return 'border-violet-400/40 bg-violet-400/10 text-violet-300';
    case 'in_progress': return 'border-amber-400/40 bg-amber-400/10 text-amber-300';
    case 'resolved': return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300';
    case 'closed': return 'border-slate-400/40 bg-slate-400/10 text-slate-300';
    default: return 'border-white/20 bg-white/5 text-slate-300';
  }
}
