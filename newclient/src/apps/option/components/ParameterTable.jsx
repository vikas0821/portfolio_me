import { useState } from "react";
import { Card, Badge, ScoreBar } from "./ui.jsx";
import { pct } from "../utils/formatters.js";
import { signalColor, PALETTE } from "../utils/colors.js";
import { useLearn } from "../context/LearnContext.jsx";
import { getEntry } from "../education/glossary.js";
import InfoTip from "./InfoTip.jsx";
import { EntryBody, Caption } from "./Explain.jsx";

export default function ParameterTable({ probability }) {
  const params = probability?.parameter_scores || [];
  const { beginner } = useLearn();
  const [expanded, setExpanded] = useState(null);

  const totalContribution = params.reduce(
    (sum, p) => sum + (p.contribution || 0),
    0
  );

  function toggle(key) {
    setExpanded((cur) => (cur === key ? null : key));
  }

  return (
    <Card
      title="Parameter Breakdown"
      subtitle="9+ weighted signals driving the probability score"
      right={
        <InfoTip entryKey="weighted_score" />
      }
    >
      <Caption entryKey="weighted_score" />
      {beginner && (
        <p className="text-[11px] text-muted mb-2">
          Tip: click any row to expand a full plain-English explanation.
        </p>
      )}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted border-b border-border">
              <th className="py-2 pr-3 font-semibold">Parameter</th>
              <th className="py-2 px-3 font-semibold">Value</th>
              <th className="py-2 px-3 font-semibold w-40">Score</th>
              <th className="py-2 px-3 font-semibold">Signal</th>
              <th className="py-2 px-3 font-semibold">Weight</th>
              <th className="py-2 pl-3 font-semibold">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p, i) => {
              const entry = getEntry(p.key);
              const canExpand = beginner && entry;
              const isOpen = expanded === p.key;
              const reading = { value: p.value, signal: p.signal, meaning: p.meaning };
              return (
                <FragmentRow key={p.key || i}>
                  <tr
                    className={
                      "border-b border-border/60 align-middle " +
                      (canExpand ? "cursor-pointer hover:bg-card/60" : "")
                    }
                    onClick={canExpand ? () => toggle(p.key) : undefined}
                  >
                    <td className="py-2.5 pr-3 font-semibold text-txt">
                      <span className="inline-flex items-center gap-1.5">
                        {canExpand && (
                          <span className="text-muted text-[10px] w-3">
                            {isOpen ? "▾" : "▸"}
                          </span>
                        )}
                        {p.name}
                        <InfoTip entryKey={p.key} reading={reading} />
                      </span>
                    </td>
                    <td className="py-2.5 px-3 num text-muted whitespace-nowrap">
                      {p.value}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <ScoreBar score={p.score} />
                        <span
                          className="num text-xs font-bold w-9 text-right"
                          style={{ color: signalColor(p.signal) }}
                        >
                          {p.score > 0 ? "+" : ""}
                          {Math.round(p.score)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge color={signalColor(p.signal)}>{p.signal}</Badge>
                    </td>
                    <td className="py-2.5 px-3 num text-muted">
                      {pct((p.weight || 0) * 100, 0)}
                    </td>
                    <td className="py-2.5 pl-3 text-xs text-muted max-w-xs">
                      {p.meaning}
                    </td>
                  </tr>
                  {canExpand && isOpen && (
                    <tr className="border-b border-border/60 bg-bg">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="max-w-2xl">
                          <EntryBody entry={entry} reading={reading} />
                        </div>
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="py-3 pr-3 font-bold text-txt">
                Total Weighted Score
              </td>
              <td colSpan={4} className="py-3 px-3">
                <span
                  className="num text-lg font-extrabold"
                  style={{ color: signalColor(probability?.direction) }}
                >
                  {probability?.weighted_score > 0 ? "+" : ""}
                  {probability?.weighted_score ?? "—"}
                </span>
                <span className="text-xs text-muted ml-2">
                  (sum of contributions {totalContribution.toFixed(1)})
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

// Helper to return two sibling rows without an extra DOM node.
function FragmentRow({ children }) {
  return <>{children}</>;
}
