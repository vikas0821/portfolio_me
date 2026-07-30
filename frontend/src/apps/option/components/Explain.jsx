// Shared renderers for education content, reused by InfoTip popovers, the
// Beginner-Mode expandable rows and the Glossary modal.
import { signalColor, PALETTE } from "../utils/colors.js";
import { getEntry, localize } from "../education/glossary.js";
import { useLearn } from "../context/LearnContext.jsx";

// UI strings that wrap the content, per language.
const UI = {
  en: {
    yourReading: "Your reading",
    whatItIs: "What it is",
    howToRead: "How to read it",
    howMeasured: "How it's measured",
    whyMatters: "Why it matters",
    example: "Real-world example",
  },
  hi: {
    yourReading: "आपकी reading",
    whatItIs: "यह क्या है",
    howToRead: "कैसे पढ़ें",
    howMeasured: "कैसे नापा जाता है",
    whyMatters: "क्यों ज़रूरी है",
    example: "असली उदाहरण",
  },
};

function ui(lang) {
  return UI[lang] || UI.en;
}

// A one-line plain-English caption shown only when Beginner Mode is on.
export function Caption({ entryKey, text, hiText }) {
  const { beginner, lang } = useLearn();
  if (!beginner) return null;
  let body = lang === "hi" ? hiText : text;
  if (!body && !text && !hiText) {
    body = localize(getEntry(entryKey), lang)?.short;
  }
  body = body || text || localize(getEntry(entryKey), lang)?.short;
  if (!body) return null;
  return (
    <p className="text-[11px] text-neutral/80 bg-neutral/5 border border-neutral/20 rounded-md px-2.5 py-1.5 mb-2">
      💡 {body}
    </p>
  );
}

function toneColor(tone) {
  if (tone === "bullish") return PALETTE.bullish;
  if (tone === "bearish") return PALETTE.bearish;
  return PALETTE.neutral;
}

// How-to-read bands (value → meaning), color-coded by tone.
export function ReadBands({ read }) {
  if (!read?.length) return null;
  return (
    <div className="space-y-1">
      {read.map((r, i) => (
        <div key={i} className="flex gap-2 text-xs">
          <span
            className="num shrink-0 font-semibold px-1.5 rounded"
            style={{ color: toneColor(r.tone), backgroundColor: toneColor(r.tone) + "1a" }}
          >
            {r.when}
          </span>
          <span className="text-txt/80">{r.meaning}</span>
        </div>
      ))}
    </div>
  );
}

// The live reading for this specific parameter (contextual interpretation).
export function LiveReading({ reading }) {
  const { lang } = useLearn();
  if (!reading) return null;
  const color = signalColor(reading.signal);
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs border"
      style={{ backgroundColor: color + "14", borderColor: color + "44" }}
    >
      <span className="uppercase tracking-wide text-[10px] text-muted">
        {ui(lang).yourReading}
      </span>
      <div className="mt-0.5">
        {reading.value != null && (
          <span className="num font-bold text-txt mr-2">{reading.value}</span>
        )}
        {reading.signal && (
          <span className="font-bold" style={{ color }}>
            {reading.signal}
          </span>
        )}
      </div>
      {reading.meaning && (
        <div className="text-txt/80 mt-0.5">{reading.meaning}</div>
      )}
    </div>
  );
}

// Full teaching body for an entry. `compact` trims to the essentials.
// Localizes internally, so callers pass the raw glossary entry.
export function EntryBody({ entry, reading, compact = false }) {
  const { lang } = useLearn();
  if (!entry) return null;
  const e = localize(entry, lang);
  const t = ui(lang);
  return (
    <div className="space-y-2.5">
      {reading && <LiveReading reading={reading} />}

      <Section label={t.whatItIs}>{e.what}</Section>

      {e.read?.length > 0 && (
        <div>
          <SectionLabel>{t.howToRead}</SectionLabel>
          <ReadBands read={e.read} />
        </div>
      )}

      {!compact && <Section label={t.howMeasured}>{e.how}</Section>}

      <Section label={t.whyMatters}>{e.why}</Section>

      {e.analogy && (
        <div className="text-xs italic text-neutral/90">💡 {e.analogy}</div>
      )}

      {!compact && e.example && (
        <div className="rounded-lg border border-bullish/30 bg-bullish/5 px-3 py-2">
          <SectionLabel>🎯 {t.example}</SectionLabel>
          <p className="text-xs text-txt/90 leading-relaxed">{e.example}</p>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="text-[10px] uppercase tracking-wide text-muted mb-0.5">
      {children}
    </div>
  );
}

function Section({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <p className="text-xs text-txt/85 leading-relaxed">{children}</p>
    </div>
  );
}
