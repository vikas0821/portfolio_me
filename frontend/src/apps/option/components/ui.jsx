// Small shared presentational primitives used across panels.
import InfoTip from "./InfoTip.jsx";

export function Card({ title, subtitle, right, className = "", children }) {
  return (
    <div
      className={
        "bg-card border border-border rounded-xl p-4 sm:p-5 shadow-lg shadow-black/20 " +
        className
      }
    >
      {(title || right) && (
        <div className="flex items-start justify-between mb-3">
          <div>
            {title && (
              <h3 className="text-sm font-semibold tracking-wide text-txt uppercase">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ children, color, className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase " +
        className
      }
      style={{
        color: color,
        backgroundColor: color ? color + "22" : "rgb(var(--c-border))",
        border: `1px solid ${color ? color + "55" : "rgb(var(--c-border))"}`,
      }}
    >
      {children}
    </span>
  );
}

export function Stat({ label, value, sub, color, mono = true, info }) {
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-3 flex flex-col gap-1 min-w-0">
      <span className="text-[11px] uppercase tracking-wide text-muted truncate flex items-center gap-1">
        {label}
        {info && <InfoTip entryKey={info} />}
      </span>
      <span
        className={"text-xl font-bold leading-tight truncate " + (mono ? "num" : "")}
        style={{ color: color || "rgb(var(--c-txt))" }}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-muted truncate">{sub}</span>}
    </div>
  );
}

// A horizontal bar that grows from a center zero point (-100..100).
export function ScoreBar({ score }) {
  const s = Math.max(-100, Math.min(100, Number(score) || 0));
  const widthPct = Math.abs(s) / 2; // half-width is 50%
  const positive = s >= 0;
  return (
    <div className="relative h-3 w-full bg-bg rounded overflow-hidden border border-border">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
      <div
        className="absolute top-0 bottom-0 bar-fill"
        style={{
          width: widthPct + "%",
          left: positive ? "50%" : `${50 - widthPct}%`,
          backgroundColor: positive ? "#00c896" : "#ff4560",
        }}
      />
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={"skeleton rounded-lg " + className} />;
}
