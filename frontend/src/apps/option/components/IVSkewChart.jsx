import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import { Card, Badge } from "./ui.jsx";
import { price } from "../utils/formatters.js";
import { PALETTE, signalColor } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import ChartHelp from "./ChartHelp.jsx";
import { Caption } from "./Explain.jsx";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <div className="font-bold num text-txt mb-1">Strike {price(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="num">{p.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function IVSkewChart({ data, iv, atm }) {
  const rows = useMemo(() => {
    return (data || [])
      .filter((r) => r.call_iv > 0 || r.put_iv > 0)
      .sort((a, b) => a.strike - b.strike)
      .map((r) => ({
        strike: r.strike,
        call_iv: r.call_iv > 0 ? r.call_iv : null,
        put_iv: r.put_iv > 0 ? r.put_iv : null,
      }));
  }, [data]);

  const skewColor =
    iv?.skew_type === "NORMAL"
      ? PALETTE.bearish
      : iv?.skew_type === "REVERSE"
      ? PALETTE.bullish
      : PALETTE.neutral;

  return (
    <Card
      title="IV Skew"
      subtitle="Implied volatility curve: CALL vs PUT"
      right={
        <div className="flex items-center gap-2">
          <Badge color={skewColor}>
            {iv?.skew_type || "—"} SKEW ({iv?.skew_degree >= 0 ? "+" : ""}
            {iv?.skew_degree ?? "—"})
          </Badge>
          <InfoTip entryKey="iv_skew" />
        </div>
      }
    >
      <Caption entryKey="iv_skew" />
      <ChartHelp guide="iv" />
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} vertical={false} />
            <XAxis
              dataKey="strike"
              tick={{ fill: PALETTE.muted, fontSize: 11 }}
              tickFormatter={(v) => price(v)}
              minTickGap={30}
            />
            <YAxis
              tick={{ fill: PALETTE.muted, fontSize: 11 }}
              tickFormatter={(v) => v + "%"}
              width={42}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="plainline"
            />
            <ReferenceLine
              x={atm}
              stroke={PALETTE.warning}
              strokeDasharray="4 4"
              label={{ value: "ATM", fill: PALETTE.warning, fontSize: 10, position: "top" }}
            />
            <Line
              type="monotone"
              dataKey="call_iv"
              name="CALL IV"
              stroke={PALETTE.neutral}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="put_iv"
              name="PUT IV"
              stroke="#f97316"
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-center text-[11px]">
        <IvBox label="ATM Call" value={iv?.atm_call_iv} />
        <IvBox label="ATM Put" value={iv?.atm_put_iv} />
        <IvBox label="OTM Call" value={iv?.otm_call_iv} />
        <IvBox label="OTM Put" value={iv?.otm_put_iv} />
      </div>
    </Card>
  );
}

function IvBox({ label, value }) {
  return (
    <div className="rounded-lg bg-bg border border-border py-1.5">
      <div className="text-muted uppercase tracking-wide">{label}</div>
      <div className="num font-bold text-txt">
        {value != null ? value.toFixed(1) + "%" : "—"}
      </div>
    </div>
  );
}
