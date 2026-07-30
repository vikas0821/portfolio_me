import { Card, Badge } from "./ui.jsx";
import { price, rupee, rupeeWhole } from "../utils/formatters.js";
import { PALETTE } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import { Caption } from "./Explain.jsx";

function legValue(leg) {
  return leg.premium * leg.lot_size;
}

// Map a strategy name to its glossary key.
function strategyKey(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("bull call")) return "bull_call_spread";
  if (n.includes("bear put")) return "bear_put_spread";
  if (n.includes("iron condor")) return "iron_condor";
  return null;
}

export default function StrategyCard({ strategy }) {
  const s = strategy || {};

  if (!s.can_trade) {
    return (
      <Card title="Suggested Strategy">
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5">
          <div className="text-warning font-extrabold text-lg flex items-center gap-2">
            ⚠️ {s.strategy_name || "NO TRADE"}
          </div>
          {s.rationale && (
            <p className="text-sm text-txt/90 mt-2">{s.rationale}</p>
          )}
          {s.warning && (
            <p className="text-xs text-warning/80 mt-2">{s.warning}</p>
          )}
        </div>
      </Card>
    );
  }

  const breakEven = Array.isArray(s.break_even)
    ? s.break_even.map((b) => price(b)).join(" / ")
    : price(s.break_even);

  const profitLo = s.profit_range?.[0];
  const profitHi = s.profit_range?.[1];

  return (
    <Card
      title="Suggested Strategy"
      right={<Badge color={PALETTE.bullish}>TRADEABLE</Badge>}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: name + legs */}
        <div className="lg:w-3/5">
          <h2 className="text-xl font-extrabold text-neutral mb-1 flex items-center gap-1.5">
            {s.strategy_name}
            {strategyKey(s.strategy_name) && (
              <InfoTip entryKey={strategyKey(s.strategy_name)} />
            )}
          </h2>
          {strategyKey(s.strategy_name) && <Caption entryKey={strategyKey(s.strategy_name)} />}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[460px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted border-b border-border">
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Strike</th>
                  <th className="py-2 px-3 text-right">Premium</th>
                  <th className="py-2 pl-3 text-right">Value / Lot</th>
                </tr>
              </thead>
              <tbody>
                {(s.legs || []).map((leg, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-2 pr-3">
                      <Badge
                        color={leg.action === "BUY" ? PALETTE.bullish : PALETTE.bearish}
                      >
                        {leg.action}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 font-semibold">{leg.type}</td>
                    <td className="py-2 px-3 num">{price(leg.strike)}</td>
                    <td className="py-2 px-3 num text-right">{rupee(leg.premium)}</td>
                    <td className="py-2 pl-3 num text-right text-muted">
                      {rupeeWhole(legValue(leg))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {s.rationale && (
            <p className="text-sm text-txt/80 mt-3">{s.rationale}</p>
          )}
          {s.warning && (
            <p className="text-xs text-warning mt-2">⚠️ {s.warning}</p>
          )}
        </div>

        {/* Right: P&L summary */}
        <div className="lg:w-2/5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <PnlBox
              label={s.net_credit > 0 ? "Net Credit" : "Net Cost"}
              value={rupeeWhole(s.net_credit > 0 ? s.net_credit : s.net_cost)}
              color={s.net_credit > 0 ? PALETTE.bullish : PALETTE.text}
            />
            <PnlBox label="Break-Even" value={breakEven} color={PALETTE.neutral} info="break_even" />
            <PnlBox label="Max Profit" value={rupeeWhole(s.max_profit)} color={PALETTE.bullish} />
            <PnlBox label="Max Loss" value={rupeeWhole(s.max_loss)} color={PALETTE.bearish} />
          </div>

          {/* Profit zone visual */}
          {profitLo != null && profitHi != null && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted mb-1">
                Profit Zone
              </div>
              <div className="relative h-6 rounded-lg bg-bg border border-border overflow-hidden">
                <div
                  className="absolute inset-y-0 bg-bullish/30 border-x border-bullish/60"
                  style={{ left: "15%", right: "15%" }}
                />
                <div className="absolute inset-0 flex items-center justify-center num text-xs font-bold text-bullish">
                  {price(profitLo)} — {price(profitHi)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function PnlBox({ label, value, color, info }) {
  return (
    <div className="rounded-lg bg-bg border border-border px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted flex items-center gap-1">
        {label}
        {info && <InfoTip entryKey={info} />}
      </div>
      <div className="num text-base font-bold mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
