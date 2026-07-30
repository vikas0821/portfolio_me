import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import UploadPanel from "./components/UploadPanel.jsx";
import Dashboard from "./components/Dashboard.jsx";
import GlossaryModal from "./components/GlossaryModal.jsx";
import { analyzeSingle, analyzeCompare } from "./api/analyzer.js";
import { useLearn } from "./context/LearnContext.jsx";
import { useTheme } from "../../context/ThemeContext";

export default function App() {
  const [mode, setMode] = useState("single"); // "single" | "compare"
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { beginner, toggleBeginner, openGlossary, lang, toggleLang } = useLearn();
  const { theme, toggleTheme } = useTheme();

  async function runSingle(file, expiry) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeSingle(file, expiry);
      setResult({ kind: "single", data });
    } catch (e) {
      setError(e.message || "Analysis failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function runCompare(file1, file2, expiry) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCompare(file1, file2, expiry);
      setResult({ kind: "compare", data });
    } catch (e) {
      setError(e.message || "Comparison failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-bg text-txt halftone-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b-[3px] border-border bg-bg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-2.5 group"
            title="Back to upload"
          >
            <span className="text-2xl w-10 h-10 flex items-center justify-center -rotate-6 rounded-xl bg-warning border-[3px] border-border group-hover:rotate-6 transition-transform duration-300">📊</span>
            <div className="text-left leading-tight">
              <div className="font-display text-lg tracking-wide">
                OPTION CHAIN <span className="text-neutral">ANALYZER</span>
              </div>
              <div className="text-[11px] text-muted font-sans">
                NIFTY · OI · Probability · Strategy
              </div>
            </div>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Global light/dark toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              aria-label="Toggle theme"
              className="p-2 rounded-lg border-2 border-border bg-card text-muted hover:text-txt transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language toggle (हिंदी / EN) */}
            <button
              onClick={toggleLang}
              title="Switch teaching language / सीखने की भाषा बदलें"
              className="flex items-center rounded-lg text-xs font-bold border-2 border-border bg-card overflow-hidden"
            >
              <span
                className={
                  "px-2 py-1.5 " +
                  (lang === "hi" ? "bg-neutral/20 text-neutral" : "text-muted")
                }
              >
                हिंदी
              </span>
              <span
                className={
                  "px-2 py-1.5 " +
                  (lang === "en" ? "bg-neutral/20 text-neutral" : "text-muted")
                }
              >
                EN
              </span>
            </button>

            {/* Beginner Mode toggle */}
            <button
              onClick={toggleBeginner}
              title="Show plain-English explanations across the dashboard"
              className={
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-colors " +
                (beginner
                  ? "bg-bullish/15 border-bullish text-bullish"
                  : "bg-card border-border text-muted hover:text-txt")
              }
            >
              <span
                className={
                  "w-8 h-4 rounded-full relative transition-colors " +
                  (beginner ? "bg-bullish/60" : "bg-border")
                }
              >
                <span
                  className={
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all " +
                    (beginner ? "left-4" : "left-0.5")
                  }
                />
              </span>
              <span className="hidden sm:inline">Beginner</span>
            </button>

            {/* Learn / glossary */}
            <button
              onClick={() => openGlossary("")}
              className="wobble-hover px-3 py-1.5 rounded-lg text-sm font-bold bg-comic-yellow border-2 border-border text-ink shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              📚 <span className="hidden sm:inline">Learn</span>
            </button>

            <div className="flex items-center gap-1 bg-card border-2 border-border rounded-lg p-1">
              <ModeButton active={mode === "single"} onClick={() => setMode("single")}>
                Single
              </ModeButton>
              <ModeButton active={mode === "compare"} onClick={() => setMode("compare")}>
                Compare
              </ModeButton>
            </div>
          </div>
        </div>
      </header>

      <GlossaryModal />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!result ? (
          <UploadPanel
            mode={mode}
            setMode={setMode}
            loading={loading}
            error={error}
            onSingle={runSingle}
            onCompare={runCompare}
          />
        ) : (
          <div>
            <button
              onClick={reset}
              className="mb-4 text-sm font-bold text-neutral hover:underline flex items-center gap-1"
            >
              ← New analysis
            </button>
            <Dashboard result={result} />
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-muted font-sans">
        Local analytical tool · Not investment advice · For educational use only.
      </footer>
    </div>
  );
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-md text-sm font-bold transition-colors " +
        (active
          ? "bg-neutral/20 text-neutral"
          : "text-muted hover:text-txt")
      }
    >
      {children}
    </button>
  );
}
