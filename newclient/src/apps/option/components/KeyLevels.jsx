import { Card, Badge } from "./ui.jsx";
import { price, lakhs, signed } from "../utils/formatters.js";
import { strengthColor, patternColor, PALETTE } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import { Caption } from "./Explain.jsx";

const FRESH_COLOR = {
  FRESH: PALETTE.bullish,
  WEAKENING: PALETTE.bearish,
  STABLE: PALETTE.muted,
};

function LevelRow({ strike, oi, chngOi, pattern, strength, strengthPct, freshness, distance, maxOi, side }) {
  const barColor = side === "resistance" ? PALETTE.bearish : PALETTE.bullish;
  const widthPct = maxOi ? Math.max(4, (oi / maxOi) * 100) : 0;
  return (
    <div className="py-2.5 border-b border-border last:border-0 min-w-0">
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="num text-lg font-bold truncate" style={{ color: barColor }}>
          {price(strike)}
        </span>
        {distance != null && (
          <span className="num text-[11px] text-muted font-normal shrink-0">
            ({signed(distance, 0)})
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1 mt-1">
        {freshness && freshness !== "STABLE" && (
          <Badge color={FRESH_COLOR[freshness]}>{freshness}</Badge>
        )}
        <Badge color={strengthColor(strength)}>{strength}</Badge>
        <Badge color={patternColor(pattern)}>{pattern}</Badge>
      </div>
      <div className="mt-1.5 h-1.5 w-full bg-bg rounded-full overflow-hidden">
        <div
          className="h-full bar-fill rounded-full"
          style={{ width: widthPct + "%", backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[11px] text-muted num">
        <span>{lakhs(oi)} OI</span>
        <span>
          ΔOI{" "}
          <span style={{ color: chngOi >= 0 ? PALETTE.bullish : PALETTE.bearish }}>
            {signed(chngOi / 1e5, 1)}L
          </span>
        </span>
        <span>{strengthPct}% of side</span>
      </div>
    </div>
  );
}

function ZoneStrip({ zones, side }) {
  if (!zones?.length) return null;
  const color = side === "resistance" ? PALETTE.bearish : PALETTE.bullish;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {zones.map((z, i) => (
        <span
          key={i}
          className="num text-[11px] px-2 py-0.5 rounded border"
          style={{ color, backgroundColor: color + "14", borderColor: color + "40" }}
          title={`${z.total_oi_lakhs}L combined OI`}
        >
          {z.width > 0 ? `${price(z.low)}–${price(z.high)}` : price(z.center)} · {z.total_oi_lakhs}L
        </span>
      ))}
    </div>
  );
}

export default function KeyLevels({ resistance, support, battlefield, zones }) {
  const maxRes = Math.max(...(resistance || []).map((r) => r.call_oi), 1);
  const maxSup = Math.max(...(support || []).map((s) => s.put_oi), 1);

  return (
    <Card
      title="Key Levels"
      subtitle="Fresh-OI-weighted walls · distance from spot in ( )"
      right={<InfoTip entryKey="resistance" />}
    >
      <Caption text="Heavy call OI above price acts as a ceiling (resistance); heavy put OI below acts as a floor (support). FRESH = being reinforced now; WEAKENING = being removed." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-bearish mb-1 flex items-center gap-1">
            Resistance ↑
            <InfoTip entryKey="resistance" />
          </div>
          {(resistance || []).map((r, i) => (
            <LevelRow
              key={i}
              side="resistance"
              strike={r.strike}
              oi={r.call_oi}
              chngOi={r.chng_oi}
              pattern={r.pattern}
              strength={r.strength}
              strengthPct={r.strength_pct}
              freshness={r.freshness}
              distance={r.distance}
              maxOi={maxRes}
            />
          ))}
          <ZoneStrip zones={zones?.resistance} side="resistance" />
        </div>
        <div className="mt-4 sm:mt-0 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-bullish mb-1 flex items-center gap-1">
            Support ↓
            <InfoTip entryKey="support" />
          </div>
          {(support || []).map((s, i) => (
            <LevelRow
              key={i}
              side="support"
              strike={s.strike}
              oi={s.put_oi}
              chngOi={s.chng_oi}
              pattern={s.pattern}
              strength={s.strength}
              strengthPct={s.strength_pct}
              freshness={s.freshness}
              distance={s.distance}
              maxOi={maxSup}
            />
          ))}
          <ZoneStrip zones={zones?.support} side="support" />
        </div>
      </div>

      {battlefield && (
        <div className="mt-4 rounded-lg bg-warning/10 border border-warning/40 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-bold text-warning flex items-center gap-1">
            ⚔️ BATTLEFIELD: {price(battlefield.strike)}
            <InfoTip entryKey="battlefield" />
          </span>
          <span className="num text-xs text-warning/80">
            Vol: {lakhs(battlefield.total_vol)}
          </span>
        </div>
      )}
    </Card>
  );
}
