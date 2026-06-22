import { Stat } from "./ui.jsx";
import { price, lakhs, signed } from "../utils/formatters.js";
import { PALETTE, deltaColor } from "../utils/colors.js";

export default function MarketSnapshot({ market, pcr, gamma }) {
  const pcrColor =
    pcr.oi > 1.05 ? PALETTE.bullish : pcr.oi < 0.95 ? PALETTE.bearish : PALETTE.neutral;
  const pcrVolColor =
    pcr.vol > 1.2 ? PALETTE.bullish : pcr.vol < 0.8 ? PALETTE.bearish : PALETTE.neutral;
  const dteColor =
    market.dte <= 3 ? PALETTE.bearish : market.dte <= 7 ? PALETTE.warning : PALETTE.bullish;

  const regime = gamma?.available ? gamma.regime : null;
  const regimeColor = regime === "POSITIVE" ? PALETTE.bullish : regime === "NEGATIVE" ? PALETTE.bearish : PALETTE.muted;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3">
      <Stat
        label="NIFTY Spot"
        value={price(market.spot, 0)}
        sub="approx (parity)"
        color={PALETTE.text}
        info="spot"
      />
      <Stat label="ATM Strike" value={price(market.atm, 0)} color={PALETTE.neutral} info="atm" />
      <Stat label="Max Pain" value={price(market.max_pain, 0)} color={PALETTE.warning} info="max_pain" />
      <Stat
        label="MP Distance"
        value={signed(market.mp_distance, 0)}
        sub="spot − max pain"
        color={deltaColor(market.mp_distance)}
        info="max_pain"
      />
      <Stat
        label="DTE"
        value={market.dte}
        sub={market.expiry || "default"}
        color={dteColor}
        mono={true}
        info="dte"
      />
      <Stat label="PCR (OI)" value={pcr.oi?.toFixed(2)} color={pcrColor} info="pcr" />
      <Stat label="PCR (Vol)" value={pcr.vol?.toFixed(2)} color={pcrVolColor} info="volume_ratio" />
      <Stat
        label="Total CALL OI"
        value={lakhs(pcr.total_call_oi)}
        color={PALETTE.bearish}
      />
      <Stat
        label="Total PUT OI"
        value={lakhs(pcr.total_put_oi)}
        color={PALETTE.bullish}
      />
      <Stat
        label="Gamma Regime"
        value={regime ? (regime === "POSITIVE" ? "Pinned" : "Trendy") : "—"}
        sub={regime ? (regime === "POSITIVE" ? "mean-revert" : "breakout") : undefined}
        color={regimeColor}
        mono={false}
        info="gex"
      />
    </div>
  );
}
