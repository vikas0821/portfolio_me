// Shared UI kit for the Resume Builder — one consistent design language
// (comic-panel + accent, light/dark) used by every page.
import { Loader2 } from 'lucide-react';

// ── Inputs ──────────────────────────────────────────────────────────────────
export const inputCls =
  'w-full bg-paper border-2 border-ink dark:border-white/60 rounded-lg px-3 py-2 text-sm ' +
  'text-ink dark:text-white placeholder:text-ink/40 dark:placeholder:text-white/40 ' +
  'focus:outline-none focus:ring-2 focus:ring-accent/40 transition';

export const labelCls =
  'block text-xs font-bold uppercase tracking-wide text-ink/60 dark:text-white/60 mb-1.5';

export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="mt-1 text-xs text-ink/50 dark:text-white/50 font-sans">{hint}</p>}
    </div>
  );
}

export const Input = (props) => <input {...props} className={`${inputCls} ${props.className || ''}`} />;
export const Textarea = (props) => <textarea {...props} className={`${inputCls} resize-y ${props.className || ''}`} />;
export const Select = (props) => <select {...props} className={`${inputCls} ${props.className || ''}`} />;

// ── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padding = 'p-5' }) {
  return (
    <div className={`comic-panel ${padding} ${className}`}>
      {children}
    </div>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────
const VARIANTS = {
  primary: 'wobble-hover bg-accent border-[3px] border-ink text-white shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  secondary: 'border-2 border-ink dark:border-white/60 text-ink dark:text-white hover:bg-ink/5 dark:hover:bg-white/5',
  ghost: 'text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white',
  danger: 'border-2 border-comic-red text-comic-red hover:bg-comic-red/10',
  success: 'wobble-hover bg-comic-green border-[3px] border-ink text-ink shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
};
const SIZES = { sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2', lg: 'px-5 py-2.5 text-sm gap-2' };

export function Button({ variant = 'secondary', size = 'md', loading, icon: Icon, children, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center font-bold rounded-lg transition-all disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" /> : Icon && <Icon size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

// ── Page header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1
          className="font-display text-3xl tracking-wide text-ink dark:text-white"
          style={{ textShadow: '3px 3px 0 rgb(var(--accent-rgb))' }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-ink/60 dark:text-white/60 font-sans">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────
const BADGE = {
  slate: 'bg-paper border-ink dark:border-white/50 text-ink dark:text-white',
  accent: 'bg-accent/15 border-accent/50 text-accent',
  blue: 'bg-comic-blue/20 border-ink dark:border-white/50 text-ink dark:text-white',
  amber: 'bg-comic-yellow/40 border-ink dark:border-white/50 text-ink dark:text-white',
  green: 'bg-comic-green/25 border-ink dark:border-white/50 text-ink dark:text-white',
  red: 'bg-comic-red/20 border-ink dark:border-white/50 text-ink dark:text-white',
  purple: 'bg-comic-pink/20 border-ink dark:border-white/50 text-ink dark:text-white',
};
export function Badge({ color = 'slate', className = '', children }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border-2 ${BADGE[color]} ${className}`}>{children}</span>;
}
export const STATUS_BADGE = { applied: 'slate', replied: 'blue', interview: 'amber', offer: 'green', rejected: 'red', ghosted: 'purple' };

// ── Empty / loading ─────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <Card className="text-center" padding="p-8 sm:p-12">
      {Icon && <div className="w-14 h-14 rounded-2xl bg-comic-yellow border-[3px] border-ink flex items-center justify-center mx-auto mb-4 text-ink rotate-3"><Icon size={22} /></div>}
      <p className="font-display text-lg tracking-wide text-ink dark:text-white">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink/50 dark:text-white/50 font-sans">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-ink/50 dark:text-white/50 py-12 justify-center font-sans">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card padding="p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-white/50">{label}</div>
        {Icon && <div className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 border-ink ${accent ? 'bg-comic-yellow text-ink' : 'bg-paper text-ink/50 dark:text-white/50'}`}><Icon size={15} /></div>}
      </div>
      <div className="mt-2 font-display text-3xl tabular-nums text-ink dark:text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink/50 dark:text-white/50 font-sans">{sub}</div>}
    </Card>
  );
}

// ── Segmented control (tabs) ──────────────────────────────────────────────────
export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex w-full sm:w-auto sm:inline-flex p-1 rounded-xl bg-paper border-2 border-ink dark:border-white/60">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            value === o.value ? 'bg-comic-yellow text-ink border-2 border-ink' : 'text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white'
          }`}
        >
          {o.icon && <o.icon size={15} className="shrink-0" />} {o.label}
        </button>
      ))}
    </div>
  );
}
