import { Card } from "./ui.jsx";
import { price } from "../utils/formatters.js";
import { PALETTE } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import ChartHelp from "./ChartHelp.jsx";
import { Caption } from "./Explain.jsx";

function Pin({ posPct, color, label, value, above }) {
  return (
    <div
      className="absolute -translate-x-1/2 flex flex-col items-center"
      style={{ left: `${posPct}%`, top: above ? "-26px" : "16px" }}
    >
      {above && (
        <span className="text-[10px] num font-bold mb-0.5" style={{ color }}>
          {label} {price(value)}
        </span>
      )}
      <span style={{ color }}>{above ? "▼" : "▲"}</span>
      {!above && (
        <span className="text-[10px] num font-bold mt-0.5" style={{ color }}>
          {label} {price(value)}
        </span>
      )}
    </div>
  );
}

export default function ExpectedRange({ range, spot, maxPain }) {
  const r = range || {};
  const lo = r.expected_lower;
  const hi = r.expected_upper;
  // Pad the axis a little beyond the expected band so pins fit.
  const span = Math.max(hi - lo, 1);
  const axisLo = Math.min(lo, spot, maxPain) - span * 0.15;
  const axisHi = Math.max(hi, spot, maxPain) + span * 0.15;
  const axisSpan = axisHi - axisLo || 1;
  const toPct = (v) => Math.max(0, Math.min(100, ((v - axisLo) / axisSpan) * 100));

  return (
    <Card
      title="Expected Range"
      subtitle="IV-implied move blended with OI walls"
      right={<InfoTip entryKey="expected_range" />}
    >
      <Caption entryKey="expected_range" />
      <ChartHelp guide="range" />
      <div className="relative pt-8 pb-10 px-2">
        {/* Track */}
        <div className="relative h-4 rounded-full bg-bg border border-border">
          {/* Expected band */}
          <div
            className="absolute top-0 bottom-0 rounded-full"
            style={{
              left: `${toPct(lo)}%`,
              width: `${toPct(hi) - toPct(lo)}%`,
              background:
                "linear-gradient(90deg, #00c89655, #00b4d855, #ffd16655)",
            }}
          />
          <Pin posPct={toPct(spot)} color={PALETTE.neutral} label="SPOT" value={spot} above />
          <Pin
            posPct={toPct(maxPain)}
            color={PALETTE.warning}
            label="MP"
            value={maxPain}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <RangeBox label="IV-based" lo={r.iv_lower} hi={r.iv_upper} color={PALETTE.neutral} />
        <RangeBox label="OI-based" lo={r.oi_lower} hi={r.oi_upper} color={PALETTE.muted} />
        <RangeBox label="Straddle 1σ" lo={r.sigma1_lower} hi={r.sigma1_upper} color={PALETTE.warning} />
        <RangeBox label="Expected" lo={lo} hi={hi} color={PALETTE.bullish} highlight />
      </div>

      {r.straddle_move > 0 && (
        <p className="text-[11px] text-muted mt-3 text-center">
          <InfoTip entryKey="straddle_move" className="mr-1" />
          ATM straddle = market-implied{" "}
          <span className="num text-txt font-semibold">±{price(r.straddle_move)}</span>{" "}
          pts by expiry · 2σ range{" "}
          <span className="num text-txt">
            {price(r.sigma2_lower)} — {price(r.sigma2_upper)}
          </span>
        </p>
      )}
    </Card>
  );
}

function RangeBox({ label, lo, hi, color, highlight }) {
  return (
    <div
      className={
        "rounded-lg px-2 py-2 border " +
        (highlight ? "bg-bullish/10 border-bullish/40" : "bg-bg border-border")
      }
    >
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="num text-sm font-bold mt-0.5" style={{ color }}>
        {price(lo)} — {price(hi)}
      </div>
    </div>
  );
}
