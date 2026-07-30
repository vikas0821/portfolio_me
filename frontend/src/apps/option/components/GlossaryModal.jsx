import { useEffect, useMemo, useState } from "react";
import {
  GLOSSARY,
  CATEGORIES,
  HOW_IT_WORKS,
  getEntry,
  localize,
  localizeStep,
  categoryLabel,
} from "../education/glossary.js";
import { useLearn } from "../context/LearnContext.jsx";
import { EntryBody } from "./Explain.jsx";

const LEVELS = ["all", "basic", "intermediate", "advanced"];
const LEVEL_COLOR = {
  basic: "#00c896",
  intermediate: "#ffd166",
  advanced: "#ff7a90",
};

const T = {
  en: {
    glossary: "Glossary",
    how: "How it predicts",
    search: "Search concepts…",
    noMatch: "No matches.",
    pick: "Pick a concept to learn about it.",
    pickSub: "New to options? Start with the basic (green) items.",
    levels: { all: "all", basic: "basic", intermediate: "intermediate", advanced: "advanced" },
    howIntro:
      "The app turns a raw option chain into a prediction in eight steps. Each step uses the signals below — tap any chip to read what it means.",
    howFoot:
      "Remember: this is a heuristic teaching tool, not a proven model — the Track Record panel shows how it actually performs on your data.",
  },
  hi: {
    glossary: "शब्दावली",
    how: "यह कैसे predict करता है",
    search: "concept खोजें…",
    noMatch: "कुछ नहीं मिला।",
    pick: "सीखने के लिए कोई concept चुनें।",
    pickSub: "Options में नए हैं? basic (हरे) items से शुरू करें।",
    levels: { all: "सभी", basic: "basic", intermediate: "intermediate", advanced: "advanced" },
    howIntro:
      "App कच्ची option chain को आठ steps में prediction में बदलता है। हर step नीचे दिए signals इस्तेमाल करता है — किसी भी chip पर tap करके उसका मतलब पढ़ें।",
    howFoot:
      "याद रखें: यह एक heuristic सीखने का tool है, सिद्ध model नहीं — Track Record panel दिखाता है कि यह आपके data पर असल में कैसा perform करता है।",
  },
};

export default function GlossaryModal() {
  const { glossaryOpen, glossaryKey, closeGlossary, lang } = useLearn();
  const t = T[lang] || T.en;
  const [tab, setTab] = useState("library"); // "library" | "how"
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [selected, setSelected] = useState(null);

  // When opened via a deep-link key, jump straight to that entry.
  useEffect(() => {
    if (glossaryOpen) {
      setTab("library");
      setSelected(glossaryKey || null);
      setQuery("");
      setLevel("all");
    }
  }, [glossaryOpen, glossaryKey]);

  useEffect(() => {
    if (!glossaryOpen) return;
    function onKey(e) {
      if (e.key === "Escape") closeGlossary();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [glossaryOpen, closeGlossary]);

  const entries = useMemo(() => Object.values(GLOSSARY), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (level !== "all" && e.level !== level) return false;
      if (!q) return true;
      // Match across both languages so search works in EN and HI.
      const hay = [
        e.title,
        e.short,
        e.category,
        e.hi?.short,
        e.hi?.what,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [entries, query, level]);

  const byCategory = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      (map[e.category] ||= []).push(e);
    }
    return map;
  }, [filtered]);

  if (!glossaryOpen) return null;

  const selectedEntry = selected ? getEntry(selected) : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeGlossary}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-bg border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold">📚 Learn</span>
            <div className="flex bg-card border border-border rounded-lg p-0.5">
              <TabBtn active={tab === "library"} onClick={() => setTab("library")}>
                {t.glossary}
              </TabBtn>
              <TabBtn active={tab === "how"} onClick={() => setTab("how")}>
                {t.how}
              </TabBtn>
            </div>
          </div>
          <button
            onClick={closeGlossary}
            className="w-8 h-8 rounded-lg border border-border text-muted hover:text-txt hover:border-muted"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {tab === "library" ? (
          <div className="flex flex-1 min-h-0">
            {/* List pane */}
            <div className="w-2/5 sm:w-1/3 border-r border-border flex flex-col min-h-0">
              <div className="p-3 space-y-2 border-b border-border">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search}
                  className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-txt placeholder:text-muted focus:outline-none focus:border-neutral"
                />
                <div className="flex flex-wrap gap-1">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={
                        "text-[10px] px-2 py-0.5 rounded-full border capitalize " +
                        (level === l
                          ? "bg-neutral/20 border-neutral/50 text-neutral"
                          : "border-border text-muted")
                      }
                    >
                      {t.levels[l]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {CATEGORIES.filter((c) => byCategory[c]?.length).map((cat) => (
                  <div key={cat}>
                    <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wide text-muted sticky top-0 bg-bg">
                      {categoryLabel(cat, lang)}
                    </div>
                    {byCategory[cat].map((e) => (
                      <button
                        key={e.key}
                        onClick={() => setSelected(e.key)}
                        className={
                          "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-card " +
                          (selected === e.key ? "bg-card" : "")
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: LEVEL_COLOR[e.level] }}
                        />
                        <span
                          className={
                            selected === e.key ? "text-txt font-semibold" : "text-txt/75"
                          }
                        >
                          {e.title}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="p-4 text-xs text-muted">{t.noMatch}</p>
                )}
              </div>
            </div>

            {/* Detail pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0">
              {selectedEntry ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-extrabold text-txt">
                      {selectedEntry.title}
                    </h2>
                    <span
                      className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{
                        color: LEVEL_COLOR[selectedEntry.level],
                        backgroundColor: LEVEL_COLOR[selectedEntry.level] + "1a",
                      }}
                    >
                      {selectedEntry.level}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    {localize(selectedEntry, lang).short}
                  </p>
                  <EntryBody entry={selectedEntry} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-sm text-muted">
                  <div>
                    <div className="text-3xl mb-2">👈</div>
                    {t.pick}
                    <br />
                    {t.pickSub}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <HowItPredicts
            lang={lang}
            t={t}
            onOpenEntry={(k) => { setTab("library"); setSelected(k); }}
          />
        )}
      </div>
    </div>
  );
}

function HowItPredicts({ onOpenEntry, lang, t }) {
  return (
    <div className="overflow-y-auto p-4 sm:p-6">
      <p className="text-sm text-txt/80 mb-4 max-w-2xl">{t.howIntro}</p>
      <ol className="space-y-3">
        {HOW_IT_WORKS.map((rawStep, i) => {
          const step = localizeStep(rawStep, lang);
          return (
            <li
              key={i}
              className="bg-card border border-border rounded-xl p-4 flex gap-4"
            >
              <div className="num text-2xl font-extrabold text-neutral/40 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="font-bold text-txt">{step.title.replace(/^\d+\.\s*/, "")}</div>
                <p className="text-xs text-txt/80 mt-1 mb-2">{step.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {rawStep.keys.map((k) => {
                    const e = getEntry(k);
                    if (!e) return null;
                    return (
                      <button
                        key={k}
                        onClick={() => onOpenEntry(k)}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-border text-neutral hover:bg-neutral/10"
                      >
                        {e.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] text-muted mt-4">{t.howFoot}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1 rounded-md text-xs font-semibold " +
        (active ? "bg-neutral/20 text-neutral" : "text-muted hover:text-txt")
      }
    >
      {children}
    </button>
  );
}
