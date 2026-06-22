import { useEffect, useRef, useState } from "react";
import { useLearn } from "../context/LearnContext.jsx";

// Navbar control: a 🎨 button opening a small popover of theme swatches.
export default function ThemePicker() {
  const { theme, setTheme, themes, lang } = useLearn();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const title = lang === "hi" ? "थीम / Theme" : "Theme";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={title}
        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-card border border-border text-neutral hover:bg-neutral/10"
      >
        🎨
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl p-1.5 shadow-2xl z-[90]">
          <div className="text-[10px] uppercase tracking-wide text-muted px-2 py-1">
            {title}
          </div>
          {Object.entries(themes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => {
                setTheme(key);
                setOpen(false);
              }}
              className={
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm " +
                (theme === key ? "bg-neutral/15" : "hover:bg-bg")
              }
            >
              <Swatch tokens={t.tokens} />
              <span className={theme === key ? "text-txt font-semibold" : "text-txt/80"}>
                {t.label}
              </span>
              {theme === key && <span className="ml-auto text-neutral text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// A mini preview of a theme: bg pill with its three accent dots.
function Swatch({ tokens }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 border"
      style={{ backgroundColor: tokens.bg, borderColor: tokens.border }}
    >
      <Dot c={tokens.bullish} />
      <Dot c={tokens.neutral} />
      <Dot c={tokens.bearish} />
    </span>
  );
}

function Dot({ c }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: c }}
    />
  );
}
