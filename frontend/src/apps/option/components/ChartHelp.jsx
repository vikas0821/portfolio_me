import { useState } from "react";
import { chartGuide } from "../education/glossary.js";
import { useLearn } from "../context/LearnContext.jsx";

// An expandable "How to read this" helper shown under a chart's heading.
// `guide` keys into CHART_GUIDES (oi | gex | iv | range). Bilingual.
export default function ChartHelp({ guide }) {
  const { lang } = useLearn();
  const [open, setOpen] = useState(false);
  const g = chartGuide(guide, lang);
  if (!g) return null;

  const label =
    lang === "hi" ? "इसे कैसे पढ़ें" : "How to read this";
  const exampleLabel = lang === "hi" ? "उदाहरण" : "Example";

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold text-neutral hover:underline"
      >
        <span>📖 {label}</span>
        <span className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-neutral/30 bg-neutral/5 px-3 py-2.5 text-xs">
          <ul className="space-y-1.5">
            {g.howTo.map((line, i) => (
              <li key={i} className="flex gap-2 text-txt/85">
                <span className="text-neutral shrink-0">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {g.example && (
            <div className="mt-2 pt-2 border-t border-neutral/20">
              <span className="text-[10px] uppercase tracking-wide text-muted">
                🎯 {exampleLabel}
              </span>
              <p className="text-txt/90 mt-0.5 leading-relaxed">{g.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
