// Shared UI kit for the Resume Builder — one consistent design language
// (slate + accent, light/dark) used by every page.
import { Loader2 } from 'lucide-react';

// ── Inputs ──────────────────────────────────────────────────────────────────
export const inputCls =
  'w-full bg-white dark:bg-[#0f0f0f] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm ' +
  'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60 transition';

export const labelCls =
  'block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5';

export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

export const Input = (props) => <input {...props} className={`${inputCls} ${props.className || ''}`} />;
export const Textarea = (props) => <textarea {...props} className={`${inputCls} resize-y ${props.className || ''}`} />;
export const Select = (props) => <select {...props} className={`${inputCls} ${props.className || ''}`} />;

// ── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padding = 'p-5' }) {
  return (
    <div className={`bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-2xl ${padding} ${className}`}>
      {children}
    </div>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────
const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent/90 shadow-sm shadow-accent/20',
  secondary: 'border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5',
  ghost: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white',
  danger: 'border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20',
};
const SIZES = { sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2', lg: 'px-5 py-2.5 text-sm gap-2' };

export function Button({ variant = 'secondary', size = 'md', loading, icon: Icon, children, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────
const BADGE = {
  slate: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300',
  accent: 'bg-accent/10 text-accent',
  blue: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
  amber: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
  green: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  red: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300',
  purple: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300',
};
export function Badge({ color = 'slate', className = '', children }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE[color]} ${className}`}>{children}</span>;
}
export const STATUS_BADGE = { applied: 'slate', replied: 'blue', interview: 'amber', offer: 'green', rejected: 'red', ghosted: 'purple' };

// ── Empty / loading ─────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <Card className="text-center" padding="p-12">
      {Icon && <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400"><Icon size={22} /></div>}
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 py-12 justify-center">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card padding="p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
        {Icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-accent/10 text-accent' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}><Icon size={15} /></div>}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</div>}
    </Card>
  );
}

// ── Segmented control (tabs) ──────────────────────────────────────────────────
export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            value === o.value ? 'bg-white dark:bg-[#222] text-accent shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {o.icon && <o.icon size={15} />} {o.label}
        </button>
      ))}
    </div>
  );
}
