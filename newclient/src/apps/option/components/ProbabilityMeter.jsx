import { Card, Badge } from "./ui.jsx";
import { pct } from "../utils/formatters.js";
import { signalColor, PALETTE } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import { Caption } from "./Explain.jsx";

function Meter({ label, value, color }) {
  const w = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {label}
        </span>
        <span className="num text-sm font-bold" style={{ color }}>
          {pct(value)}
        </span>
      </div>
      <div className="h-3 w-full bg-bg rounded-full overflow-hidden border border-border">
        <div
          className="h-full bar-fill rounded-full"
          style={{ width: w + "%", backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ProbabilityMeter({ probability }) {
  const p = probability || {};
  const dirColor = signalColor(p.direction);
  const confColor =
    p.confidence === "HIGH"
      ? PALETTE.bullish
      : p.confidence === "MODERATE"
      ? PALETTE.warning
      : PALETTE.muted;

  return (
    <Card>
      <Caption entryKey="weighted_score" />
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Direction block */}
        <div className="flex flex-col justify-center items-center lg:items-start lg:w-1/3 gap-3">
          <span className="text-xs uppercase tracking-widest text-muted flex items-center gap-1">
            Market Bias
            <InfoTip entryKey="weighted_score" />
          </span>
          <div
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{ color: dirColor }}
          >
            {p.direction || "—"}
          </div>
          <div className="flex items-center gap-2">
            <Badge color={confColor}>{p.confidence || "—"} confidence</Badge>
            <span className="num text-sm text-muted">
              score{" "}
              <span style={{ color: dirColor }} className="font-bold">
                {p.weighted_score > 0 ? "+" : ""}
                {p.weighted_score ?? "—"}
              </span>
            </span>
          </div>
        </div>

        {/* Meters */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <Meter label="Bullish" value={p.bullish_pct} color={PALETTE.bullish} />
          <Meter label="Bearish" value={p.bearish_pct} color={PALETTE.bearish} />
          <Meter label="Sideways" value={p.sideways_pct} color={PALETTE.warning} />
        </div>
      </div>
    </Card>
  );
}
