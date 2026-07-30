import { Card } from "./ui.jsx";
import { signalColor } from "../utils/colors.js";

// Light heuristic: tint a takeaway by any bullish/bearish keywords it contains.
function lineColor(text) {
  const t = text.toLowerCase();
  if (/bull|support|pull up|put writ/.test(t)) return signalColor("BULLISH");
  if (/bear|resistance|pull down|call writ/.test(t)) return signalColor("BEARISH");
  return "rgb(var(--c-txt))"; // theme text color (adapts to light/dark)
}

export default function SummaryPanel({ summary, probability }) {
  const points = summary || [];
  return (
    <Card title="Key Takeaways">
      <ol className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span className="num text-muted shrink-0 w-5 text-right">{i + 1}.</span>
            <span style={{ color: lineColor(p) }}>{p}</span>
          </li>
        ))}
      </ol>

      {probability?.reasoning?.length > 0 && (
        <details className="mt-4 group">
          <summary className="cursor-pointer text-xs text-neutral hover:underline">
            Why this bias? (model reasoning)
          </summary>
          <ul className="mt-2 space-y-1 pl-4 list-disc text-xs text-muted">
            {probability.reasoning.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
