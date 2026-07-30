import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { Card } from "./ui.jsx";
import ChartHelp from "./ChartHelp.jsx";
import { price, lakhs } from "../utils/formatters.js";
import { PALETTE } from "../utils/colors.js";

const METRICS = {
  OI: { call: "call_oi", put: "put_oi", scale: 1e5, unit: "L" },
  Volume: { call: "call_vol", put: "put_vol", scale: 1e5, unit: "L" },
  IV: { call: "call_iv", put: "put_iv", scale: 1, unit: "%" },
};

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  const m = METRICS[metric];
  const fmt = (v) =>
    m.scale === 1e5 ? lakhs(v) : `${Number(v).toFixed(1)}${m.unit}`;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <div className="font-bold num text-txt mb-1">Strike {price(label)}</div>
      <div className="flex justify-between gap-4">
        <span className="text-bearish">CALL {metric}</span>
        <span className="num">{fmt(row[m.call])}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-bullish">PUT {metric}</span>
        <span className="num">{fmt(row[m.put])}</span>
      </div>
      {metric === "OI" && (
        <div className="mt-1 pt-1 border-t border-border text-muted">
          <div className="flex justify-between gap-4">
            <span>CALL LTP</span>
            <span className="num">{row.call_ltp ?? "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OIChart({ data, atm }) {
  const [metric, setMetric] = useState("OI");
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    if (!data?.length) return [];
    const sorted = [...data].sort((a, b) => a.strike - b.strike);
    if (showAll) return sorted;
    const atmIdx = sorted.reduce(
      (best, r, i) =>
        Math.abs(r.strike - atm) < Math.abs(sorted[best].strike - atm) ? i : best,
      0
    );
    const lo = Math.max(0, atmIdx - 10);
    const hi = Math.min(sorted.length, atmIdx + 11);
    return sorted.slice(lo, hi);
  }, [data, atm, showAll]);

  const m = METRICS[metric];
  const chartData = rows.map((r) => ({
    ...r,
    _call: m.scale === 1e5 ? r[m.call] / m.scale : r[m.call],
    _put: m.scale === 1e5 ? r[m.put] / m.scale : r[m.put],
  }));

  return (
    <Card
      title="Open Interest Distribution"
      subtitle={`CALL vs PUT ${metric} by strike`}
      right={
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-bg border border-border rounded-lg p-0.5">
            {Object.keys(METRICS).map((k) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={
                  "px-2.5 py-1 rounded text-xs font-semibold " +
                  (metric === k ? "bg-neutral/20 text-neutral" : "text-muted")
                }
              >
                {k}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAll((s) => !s)}
            className="px-2.5 py-1 rounded text-xs font-semibold bg-bg border border-border text-muted hover:text-txt"
          >
            {showAll ? "ATM ±10" : "Show All"}
          </button>
        </div>
      }
    >
      <ChartHelp guide="oi" />
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} vertical={false} />
            <XAxis
              dataKey="strike"
              tick={{ fill: PALETTE.muted, fontSize: 11 }}
              tickFormatter={(v) => price(v)}
              interval="preserveStartEnd"
              minTickGap={showAll ? 30 : 8}
            />
            <YAxis
              tick={{ fill: PALETTE.muted, fontSize: 11 }}
              tickFormatter={(v) => v + m.unit}
              width={48}
            />
            <Tooltip
              content={<CustomTooltip metric={metric} />}
              cursor={{ fill: PALETTE.muted + "22" }}
            />
            <ReferenceLine x={atm} stroke={PALETTE.warning} strokeDasharray="4 4" />
            <Bar dataKey="_call" name={`CALL ${metric}`} radius={[2, 2, 0, 0]}>
              {chartData.map((r, i) => (
                <Cell
                  key={i}
                  fill={r.strike === atm ? "#ff7a90" : PALETTE.bearish}
                  fillOpacity={r.strike === atm ? 1 : 0.85}
                />
              ))}
            </Bar>
            <Bar dataKey="_put" name={`PUT ${metric}`} radius={[2, 2, 0, 0]}>
              {chartData.map((r, i) => (
                <Cell
                  key={i}
                  fill={r.strike === atm ? "#4de3bb" : PALETTE.bullish}
                  fillOpacity={r.strike === atm ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 justify-center mt-2 text-xs">
        <Legend color={PALETTE.bearish} label={`CALL ${metric}`} />
        <Legend color={PALETTE.bullish} label={`PUT ${metric}`} />
        <Legend color={PALETTE.warning} label="ATM" dashed />
      </div>
    </Card>
  );
}

function Legend({ color, label, dashed }) {
  return (
    <span className="flex items-center gap-1.5 text-muted">
      <span
        className="inline-block w-3 h-3 rounded-sm"
        style={{
          backgroundColor: dashed ? "transparent" : color,
          border: dashed ? `2px dashed ${color}` : "none",
        }}
      />
      {label}
    </span>
  );
}
