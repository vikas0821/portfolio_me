import { useEffect, useState } from "react";
import { Card, Badge } from "./ui.jsx";
import { pct, price, signed } from "../utils/formatters.js";
import { signalColor, PALETTE } from "../utils/colors.js";
import { getJournalStats, resetJournal } from "../api/analyzer.js";
import InfoTip from "./InfoTip.jsx";

export default function TrackRecord({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setError(null);
      setStats(await getJournalStats());
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    // refreshKey changes whenever a new analysis is run.
  }, [refreshKey]);

  async function handleReset() {
    await resetJournal();
    load();
  }

  if (error) {
    return (
      <Card title="Prediction Track Record">
        <p className="text-sm text-muted">{error}</p>
      </Card>
    );
  }
  if (!stats) {
    return (
      <Card title="Prediction Track Record">
        <p className="text-sm text-muted">Loading…</p>
      </Card>
    );
  }

  const hr = stats.hit_rate;
  const hrColor =
    hr == null ? PALETTE.muted : hr >= 55 ? PALETTE.bullish : hr >= 45 ? PALETTE.warning : PALETTE.bearish;

  return (
    <Card
      title="Prediction Track Record"
      subtitle="Each upload's call is graded against the next snapshot's move"
      right={
        <div className="flex items-center gap-2">
          <InfoTip entryKey="track_record" />
          <button
            onClick={handleReset}
            className="text-xs text-muted hover:text-bearish border border-border rounded px-2 py-1"
          >
            Reset
          </button>
        </div>
      }
    >
      {/* Headline stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Mini label="Hit Rate" value={hr == null ? "—" : pct(hr)} color={hrColor} />
        <Mini label="Resolved" value={stats.resolved} />
        <Mini label="Correct" value={stats.correct} color={PALETTE.bullish} />
        <Mini label="Open" value={stats.open} color={PALETTE.muted} />
      </div>

      {stats.resolved === 0 && (
        <p className="text-xs text-muted mb-3">
          Upload a newer snapshot of the same underlying to start grading
          predictions. Hit-rate appears once at least one is resolved.
        </p>
      )}

      {/* Per-direction breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {["BULLISH", "BEARISH", "SIDEWAYS"].map((d) => {
          const row = stats.by_direction?.[d] || {};
          return (
            <div key={d} className="rounded-lg bg-bg border border-border px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide" style={{ color: signalColor(d) }}>
                {d}
              </div>
              <div className="num text-sm font-bold text-txt">
                {row.rate == null ? "—" : pct(row.rate)}
              </div>
              <div className="text-[10px] text-muted num">
                {row.correct || 0}/{row.total || 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent predictions */}
      {stats.recent?.length > 0 && (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs min-w-[420px]">
            <thead className="sticky top-0 bg-card">
              <tr className="text-left text-[10px] uppercase tracking-wide text-muted border-b border-border">
                <th className="py-1.5 pr-2">Time</th>
                <th className="py-1.5 px-2">Call</th>
                <th className="py-1.5 px-2 text-right">Spot</th>
                <th className="py-1.5 px-2 text-right">Move</th>
                <th className="py-1.5 pl-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((e, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 pr-2 num text-muted">
                    {(e.timestamp || "").slice(5, 16).replace("T", " ")}
                  </td>
                  <td className="py-1.5 px-2">
                    <span style={{ color: signalColor(e.direction) }} className="font-semibold">
                      {e.direction}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 num text-right">{price(e.spot)}</td>
                  <td className="py-1.5 px-2 num text-right text-muted">
                    {e.actual_move != null ? signed(e.actual_move, 0) : "—"}
                  </td>
                  <td className="py-1.5 pl-2">
                    {e.resolved ? (
                      <Badge
                        color={e.outcome === "CORRECT" ? PALETTE.bullish : PALETTE.bearish}
                      >
                        {e.outcome}
                      </Badge>
                    ) : (
                      <span className="text-muted">open</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Mini({ label, value, color }) {
  return (
    <div className="rounded-lg bg-bg border border-border px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="num text-xl font-bold mt-0.5" style={{ color: color || "rgb(var(--c-txt))" }}>
        {value}
      </div>
    </div>
  );
}
