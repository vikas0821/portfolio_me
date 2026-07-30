import { useState } from "react";

function DropZone({ label, file, onFile }) {
  // A transparent, full-size native <input type="file"> overlays the zone so a
  // tap/click hits the real input directly (programmatically clicking a hidden
  // input is blocked on mobile browsers). It also handles drag-drop natively.
  return (
    <div className="relative rounded-2xl border-[3px] border-dashed border-border bg-card p-8 text-center transition-colors hover:border-neutral focus-within:border-neutral">
      {/* No `accept` filter — Android file pickers wrongly grey out valid .csv
          files; the backend validates/parses the CSV instead. */}
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        aria-label={label || "Upload CSV"}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="pointer-events-none">
        <div className="text-3xl mb-2">{file ? "✅" : "📁"}</div>
        {label && (
          <div className="text-xs uppercase tracking-wide text-muted mb-1 font-bold">
            {label}
          </div>
        )}
        {file ? (
          <div className="text-sm font-bold text-bullish break-all">
            {file.name}
          </div>
        ) : (
          <>
            <div className="text-sm font-bold text-txt">
              Drag &amp; drop CSV here
            </div>
            <div className="text-xs text-muted mt-1 font-sans">or tap to browse</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function UploadPanel({
  mode,
  setMode,
  loading,
  error,
  onSingle,
  onCompare,
}) {
  const [file, setFile] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [expiry, setExpiry] = useState("");

  const canSingle = file && !loading;
  const canCompare = file1 && file2 && !loading;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1
          className="font-display text-3xl sm:text-4xl uppercase tracking-wide"
          style={{ textShadow: "3px 3px 0 rgb(var(--c-neutral))" }}
        >
          Analyze your NSE Option Chain
        </h1>
        <p className="text-muted mt-3 text-sm font-sans">
          Upload an NSE option-chain CSV and get probability scores, key levels,
          charts and a suggested strategy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-5">
        <TabButton active={mode === "single"} onClick={() => setMode("single")}>
          Single Snapshot
        </TabButton>
        <TabButton active={mode === "compare"} onClick={() => setMode("compare")}>
          Compare Two
        </TabButton>
      </div>

      <div className="bg-card border-[3px] border-border rounded-2xl p-5 sm:p-6 shadow-comic-sm">
        {mode === "single" ? (
          <DropZone file={file} onFile={setFile} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DropZone label="Older Snapshot" file={file1} onFile={setFile1} />
            <DropZone label="Newer Snapshot" file={file2} onFile={setFile2} />
          </div>
        )}

        {/* Expiry picker */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm text-muted whitespace-nowrap">
            Expiry date <span className="text-muted/70">(optional)</span>
          </label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="num bg-bg border border-border rounded-lg px-3 py-2 text-sm text-txt focus:outline-none focus:border-neutral"
          />
          <div className="flex-1" />
          {mode === "single" ? (
            <button
              disabled={!canSingle}
              onClick={() => onSingle(file, expiry || null)}
              className={btnClass(canSingle)}
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          ) : (
            <button
              disabled={!canCompare}
              onClick={() => onCompare(file1, file2, expiry || null)}
              className={btnClass(canCompare)}
            >
              {loading ? "Comparing…" : "Compare"}
            </button>
          )}
        </div>

        {loading && (
          <div className="mt-5 flex items-center gap-3 text-sm text-neutral">
            <span className="inline-block w-4 h-4 border-2 border-neutral border-t-transparent rounded-full animate-spin" />
            Crunching the option chain…
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-bearish/50 bg-bearish/10 px-4 py-3 text-sm text-bearish">
            <span className="font-semibold">Error: </span>
            {error}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted mt-5">
        Tip: export the option chain from{" "}
        <span className="text-neutral">nseindia.com</span> → Option Chain →
        Download (CSV). No real data? Run{" "}
        <code className="num text-txt">python mock_data_generator.py</code>.
      </p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded-lg text-sm font-semibold border transition-colors " +
        (active
          ? "bg-neutral/15 border-neutral/50 text-neutral"
          : "bg-card border-border text-muted hover:text-txt")
      }
    >
      {children}
    </button>
  );
}

function btnClass(enabled) {
  return (
    "px-6 py-2 rounded-lg text-sm font-bold transition-colors " +
    (enabled
      ? "bg-neutral text-bg hover:bg-neutral/90"
      : "bg-border text-muted cursor-not-allowed")
  );
}
