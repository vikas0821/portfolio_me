import { Card, Badge } from "./ui.jsx";
import { price, signed, rupee } from "../utils/formatters.js";
import { patternColor } from "../utils/colors.js";
import InfoTip from "./InfoTip.jsx";
import { Caption } from "./Explain.jsx";

export default function OIPatternTable({ patterns, atm }) {
  const rows = patterns || [];
  return (
    <Card
      title="ATM Zone OI Patterns"
      subtitle="Build-up across ATM ± 300 strikes"
      right={<InfoTip entryKey="oi_pattern" />}
    >
      <Caption entryKey="oi_pattern" />
      <div className="overflow-x-auto max-h-96 overflow-y-auto -mx-1">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted border-b border-border">
              <th className="py-2 pr-3 font-semibold">Strike</th>
              <th className="py-2 px-2 font-semibold">CALL</th>
              <th className="py-2 px-2 font-semibold">PUT</th>
              <th className="py-2 px-2 font-semibold text-right">C ΔOI</th>
              <th className="py-2 px-2 font-semibold text-right">P ΔOI</th>
              <th className="py-2 px-2 font-semibold text-right">C LTP</th>
              <th className="py-2 pl-2 font-semibold text-right">P LTP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isAtm = r.is_atm || r.strike === atm;
              return (
                <tr
                  key={i}
                  className={
                    "border-b border-border/50 " +
                    (isAtm ? "bg-warning/10" : "")
                  }
                >
                  <td className="py-2 pr-3 num font-bold">
                    {price(r.strike)}
                    {isAtm && (
                      <span className="ml-1 text-[9px] text-warning align-middle">
                        ATM
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <Badge color={patternColor(r.c_pattern)}>{r.c_pattern}</Badge>
                  </td>
                  <td className="py-2 px-2">
                    <Badge color={patternColor(r.p_pattern)}>{r.p_pattern}</Badge>
                  </td>
                  <td className="py-2 px-2 num text-right text-muted">
                    {signed(r.c_chng_oi / 1000, 0)}K
                  </td>
                  <td className="py-2 px-2 num text-right text-muted">
                    {signed(r.p_chng_oi / 1000, 0)}K
                  </td>
                  <td className="py-2 px-2 num text-right text-muted">
                    {rupee(r.c_ltp)}
                  </td>
                  <td className="py-2 pl-2 num text-right text-muted">
                    {rupee(r.p_ltp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
