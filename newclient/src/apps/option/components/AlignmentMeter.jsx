import { Card, Badge } from "./ui.jsx";
import { pct } from "../utils/formatters.js";
import { signalColor, PALETTE } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import { Caption } from "./Explain.jsx";

function Dot({ signal }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: signalColor(signal) }}
      title={signal}
    />
  );
}

export default function AlignmentMeter({ alignment }) {
  const a = alignment || {};
  const signals = a.signals || [];
  const convColor =
    a.conviction === "HIGH"
      ? PALETTE.bullish
      : a.conviction === "MODERATE"
      ? PALETTE.warning
      : PALETTE.muted;

  const total = signals.length || 1;
  const bull = a.bullish_count || 0;
  const bear = a.bearish_count || 0;
  const neu = a.neutral_count || 0;

  return (
    <Card
      title="Signal Alignment"
      subtitle="How many independent signals agree"
      right={
        <div className="flex items-center gap-2">
          <Badge color={convColor}>{a.conviction || "—"} conviction</Badge>
          <InfoTip entryKey="alignment" />
        </div>
      }
    >
      <Caption entryKey="alignment" />
      {/* Agreement summary */}
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div
            className="text-3xl font-extrabold"
            style={{ color: signalColor(a.aligned_direction) }}
          >
            {pct(a.agreement_pct)}
          </div>
          <div className="text-[11px] text-muted uppercase tracking-wide">
            agree {a.aligned_direction}
          </div>
        </div>

        {/* Stacked bar */}
        <div className="flex-1">
          <div className="flex h-4 w-full rounded-full overflow-hidden border border-border">
            <div
              style={{ width: `${(bull / total) * 100}%`, backgroundColor: PALETTE.bullish }}
              title={`${bull} bullish`}
            />
            <div
              style={{ width: `${(neu / total) * 100}%`, backgroundColor: PALETTE.muted }}
              title={`${neu} neutral`}
            />
            <div
              style={{ width: `${(bear / total) * 100}%`, backgroundColor: PALETTE.bearish }}
              title={`${bear} bearish`}
            />
          </div>
          <div className="flex justify-between mt-1 text-[11px] text-muted num">
            <span className="text-bullish">{bull} bullish</span>
            <span>{neu} neutral</span>
            <span className="text-bearish">{bear} bearish</span>
          </div>
        </div>
      </div>

      {a.conflict && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 mb-3 text-xs text-warning">
          ⚠️ Signals are split — treat the headline bias with caution.
        </div>
      )}

      {/* Per-signal list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-txt/80">
              <Dot signal={s.signal} />
              {s.name}
            </span>
            <span
              className="font-semibold"
              style={{ color: signalColor(s.signal) }}
            >
              {s.signal}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
