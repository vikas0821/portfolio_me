import { useState } from "react";
import { Card, Badge, Stat } from "./ui.jsx";
import { SingleDashboard } from "./Dashboard.jsx";
import { price, signed, lakhs } from "../utils/formatters.js";
import { PALETTE, signalColor, deltaColor } from "../utils/colors.js";

export default function ComparisonPanel({ comparison }) {
  const { snapshot1, snapshot2, changes } = comparison;
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  const dir1 = snapshot1.probability.direction;
  const dir2 = snapshot2.probability.direction;
  const reversal = dir1 !== dir2;

  return (
    <div className="flex flex-col gap-5">
      {/* Sentiment shift banner */}
      <div
        className="rounded-xl px-5 py-4 border flex items-center justify-between flex-wrap gap-2"
        style={{
          backgroundColor: signalColor(dir2) + "18",
          borderColor: signalColor(dir2) + "55",
        }}
      >
        <span className="text-lg font-extrabold">
          📊{" "}
          {reversal ? "SENTIMENT REVERSAL: " : "SENTIMENT: "}
          <span style={{ color: signalColor(dir1) }}>{dir1}</span>
          <span className="text-muted mx-2">→</span>
          <span style={{ color: signalColor(dir2) }}>{dir2}</span>
        </span>
        <Badge color={signalColor(dir2)}>{changes.sentiment_shift}</Badge>
      </div>

      {/* Change summary cards */}
      <Card title="What Changed" subtitle="Older snapshot → newer snapshot">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Stat
            label="NIFTY Move"
            value={signed(changes.nifty_move, 0) + " pts"}
            color={deltaColor(changes.nifty_move)}
          />
          <Stat
            label="PCR Shift"
            value={`${snapshot1.pcr.oi.toFixed(2)} → ${snapshot2.pcr.oi.toFixed(2)}`}
            sub={signed(changes.pcr_change, 2)}
            color={deltaColor(changes.pcr_change)}
          />
          <Stat
            label="Max Pain"
            value={`${price(snapshot1.market.max_pain)} → ${price(
              snapshot2.market.max_pain
            )}`}
            sub={signed(changes.max_pain_shift, 0) + " pts"}
            color={PALETTE.warning}
          />
          <Stat
            label="CALL OI Δ"
            value={signed(changes.call_oi_change / 1e5, 1) + " L"}
            color={deltaColor(-changes.call_oi_change)}
          />
          <Stat
            label="PUT OI Δ"
            value={signed(changes.put_oi_change / 1e5, 1) + " L"}
            color={deltaColor(changes.put_oi_change)}
          />
        </div>
      </Card>

      {/* OI unwinding alerts */}
      {changes.oi_unwinding?.length > 0 && (
        <Card title="OI Unwinding Alerts" subtitle="Large OI drops vs prior snapshot">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {changes.oi_unwinding.map((u, i) => (
              <div
                key={i}
                className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3"
              >
                <div className="font-bold text-warning text-sm">
                  {price(u.strike)} {u.type}: {signed(u.oi_change / 1000, 0)}K OI
                </div>
                <div className="text-xs text-txt/80 mt-1">{u.note}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New levels */}
      {(changes.new_resistances?.length > 0 ||
        changes.new_supports?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title="New Resistance Walls">
            <NewLevels items={changes.new_resistances} side="resistance" />
          </Card>
          <Card title="New Support Walls">
            <NewLevels items={changes.new_supports} side="support" />
          </Card>
        </div>
      )}

      {/* Key observations */}
      <Card title="Key Observations">
        <ul className="space-y-2 text-sm">
          {(changes.key_observations || []).map((o, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-neutral">▸</span>
              <span className="text-txt/90">{o}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Collapsible mini-dashboards */}
      <Card
        title="Older Snapshot"
        subtitle={snapshot1.timestamp?.slice(0, 19).replace("T", " ")}
        right={
          <ToggleBtn open={open1} onClick={() => setOpen1((o) => !o)} />
        }
      >
        {open1 ? (
          <div className="mt-2">
            <SingleDashboard data={snapshot1} />
          </div>
        ) : (
          <MiniSummary data={snapshot1} />
        )}
      </Card>

      <Card
        title="Newer Snapshot"
        subtitle={snapshot2.timestamp?.slice(0, 19).replace("T", " ")}
        right={
          <ToggleBtn open={open2} onClick={() => setOpen2((o) => !o)} />
        }
      >
        {open2 ? (
          <div className="mt-2">
            <SingleDashboard data={snapshot2} />
          </div>
        ) : (
          <MiniSummary data={snapshot2} />
        )}
      </Card>
    </div>
  );
}

function ToggleBtn({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-lg text-xs font-semibold bg-bg border border-border text-neutral hover:bg-neutral/10"
    >
      {open ? "Collapse ▲" : "Expand ▼"}
    </button>
  );
}

function MiniSummary({ data }) {
  const p = data.probability;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat label="Bias" value={p.direction} color={signalColor(p.direction)} mono={false} />
      <Stat label="Spot" value={price(data.market.spot)} />
      <Stat label="Max Pain" value={price(data.market.max_pain)} color={PALETTE.warning} />
      <Stat label="PCR (OI)" value={data.pcr.oi.toFixed(2)} color={PALETTE.neutral} />
    </div>
  );
}

function NewLevels({ items, side }) {
  if (!items?.length) {
    return <p className="text-sm text-muted">No new levels.</p>;
  }
  const color = side === "resistance" ? PALETTE.bearish : PALETTE.bullish;
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b border-border/60 pb-1.5 last:border-0"
        >
          <span className="num font-bold" style={{ color }}>
            {price(it.strike)}
          </span>
          <span className="num text-xs text-muted">
            {lakhs(side === "resistance" ? it.call_oi : it.put_oi)}
          </span>
          <Badge color={color}>{it.strength}</Badge>
        </div>
      ))}
    </div>
  );
}
