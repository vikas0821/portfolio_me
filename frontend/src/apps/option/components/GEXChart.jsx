import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, Badge, Stat } from "./ui.jsx";
import { price } from "../utils/formatters.js";
import { PALETTE } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import ChartHelp from "./ChartHelp.jsx";
import { Caption } from "./Explain.jsx";

function GexTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <div className="font-bold num text-txt mb-1">Strike {price(label)}</div>
      <div className="flex justify-between gap-4">
        <span className="text-muted">Net GEX (relative)</span>
        <span
          className="num"
          style={{ color: row.net_gex >= 0 ? PALETTE.bullish : PALETTE.bearish }}
        >
          {row.net_gex >= 0 ? "+" : ""}
          {row.net_gex}
        </span>
      </div>
      <div className="text-[10px] text-muted mt-1">
        Read the sign &amp; relative size, not an absolute ₹ value.
      </div>
    </div>
  );
}

export default function GEXChart({ gamma, spot }) {
  const g = gamma || {};
  if (!g.available) {
    return (
      <Card title="Gamma Exposure (GEX)">
        <p className="text-sm text-muted">
          {g.interpretation || "Gamma exposure unavailable (missing IV data)."}
        </p>
      </Card>
    );
  }

  const regimeColor = g.regime === "POSITIVE" ? PALETTE.bullish : PALETTE.bearish;
  const data = g.profile || [];

  return (
    <Card
      title="Gamma Exposure (GEX)"
      subtitle="Dealer gamma by strike → regime, flip level & gamma walls"
      right={
        <div className="flex items-center gap-2">
          <Badge color={regimeColor}>{g.net_label || g.regime} GAMMA</Badge>
          <InfoTip entryKey="gex" />
        </div>
      }
    >
      <Caption entryKey="gex" />
      <ChartHelp guide="gex" />
      {/* Regime explainer */}
      <div
        className="rounded-lg px-4 py-2.5 mb-3 text-xs border"
        style={{ backgroundColor: regimeColor + "14", borderColor: regimeColor + "44" }}
      >
        <span className="font-semibold" style={{ color: regimeColor }}>
          {g.regime === "POSITIVE" ? "Pinned / mean-reverting. " : "Trendy / volatile. "}
        </span>
        <span className="text-txt/80">{g.interpretation}</span>
      </div>

      {/* Key levels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Stat
          label="Zero-Gamma Flip"
          value={g.zero_gamma != null ? price(g.zero_gamma) : "out of range"}
          sub={
            g.spot_vs_flip != null
              ? `spot ${g.spot_vs_flip >= 0 ? "+" : ""}${g.spot_vs_flip}`
              : undefined
          }
          color={PALETTE.neutral}
          info="zero_gamma"
        />
        <Stat label="Call Wall (R)" value={price(g.call_wall)} color={PALETTE.bearish} info="gamma_walls" />
        <Stat label="Put Wall (S)" value={price(g.put_wall)} color={PALETTE.bullish} info="gamma_walls" />
        <Stat label="Gamma Magnet" value={price(g.magnet)} color={PALETTE.warning} info="gamma_walls" />
      </div>

      {/* Profile chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} vertical={false} />
            <XAxis
              dataKey="strike"
              tick={{ fill: PALETTE.muted, fontSize: 11 }}
              tickFormatter={(v) => price(v)}
              minTickGap={24}
            />
            <YAxis tick={{ fill: PALETTE.muted, fontSize: 11 }} width={46} />
            <Tooltip content={<GexTooltip />} cursor={{ fill: PALETTE.muted + "22" }} />
            <ReferenceLine y={0} stroke={PALETTE.muted} />
            {spot != null && (
              <ReferenceLine
                x={nearestStrike(data, spot)}
                stroke={PALETTE.neutral}
                strokeDasharray="4 4"
                label={{ value: "Spot", fill: PALETTE.neutral, fontSize: 10, position: "top" }}
              />
            )}
            {g.zero_gamma != null && (
              <ReferenceLine
                x={nearestStrike(data, g.zero_gamma)}
                stroke={PALETTE.warning}
                strokeDasharray="2 2"
                label={{ value: "Flip", fill: PALETTE.warning, fontSize: 10, position: "insideTopRight" }}
              />
            )}
            <Bar dataKey="net_gex" name="Net GEX" radius={[2, 2, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.net_gex >= 0 ? PALETTE.bullish : PALETTE.bearish}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-muted mt-2">
        Green bars = positive gamma (suppressive). Red = negative gamma
        (amplifying). Price tends to gravitate toward the largest-magnitude
        strikes and stall at the call/put walls.
      </p>
    </Card>
  );
}

// Recharts category axis needs a value that exists in the data domain.
function nearestStrike(data, target) {
  if (!data?.length) return target;
  return data.reduce(
    (best, d) =>
      Math.abs(d.strike - target) < Math.abs(best - target) ? d.strike : best,
    data[0].strike
  );
}
