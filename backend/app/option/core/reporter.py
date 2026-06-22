"""Assembles the full AnalysisResult / ComparisonResult JSON payloads."""

from datetime import date, datetime

import pandas as pd

from app.option.config import ATM_ZONE_RANGE
from app.option.core import calculator
from app.option.core.probability import compute_probability
from app.option.modules import oi_analysis
from app.option.modules.iv_analysis import get_iv_summary
from app.option.modules.greeks import estimate_atm_greeks
from app.option.modules.strategy import suggest_strategy
from app.option.modules.gamma import compute_gex, gex_signal
from app.option.modules.alignment import compute_alignment
from app.option.modules import journal


def _compute_dte(expiry: str | None) -> tuple:
    """Return (dte, expiry_str). Falls back to DEFAULT_DTE if not parseable."""
    from app.option.config import DEFAULT_DTE
    if expiry:
        try:
            exp_date = datetime.strptime(expiry, "%Y-%m-%d").date()
            dte = (exp_date - date.today()).days
            return max(dte, 0), expiry
        except ValueError:
            pass
    return DEFAULT_DTE, expiry or ""


def _spot_from_atm(df: pd.DataFrame, atm: float) -> float:
    """Estimate spot using put-call parity at the ATM strike (r~0).

    spot ~= strike + call_ltp - put_ltp.
    """
    row = df[df["strike"] == atm]
    if row.empty:
        return atm
    c = float(row["c_ltp"].iloc[0])
    p = float(row["p_ltp"].iloc[0])
    if c > 0 and p > 0:
        return round(atm + c - p, 2)
    return atm


def _oi_chart_data(df: pd.DataFrame) -> list:
    out = []
    for _, row in df.iterrows():
        out.append({
            "strike": float(row["strike"]),
            "call_oi": float(row["c_oi"]),
            "put_oi": float(row["p_oi"]),
            "call_vol": float(row["c_vol"]),
            "put_vol": float(row["p_vol"]),
            "call_iv": float(row["c_iv"]),
            "put_iv": float(row["p_iv"]),
        })
    return out


def _build_summary(market, pcr, prob, iv, levels_res, levels_sup, battlefield, exp_range, gex=None):
    s = []
    s.append(
        f"NIFTY spot ~{market['spot']:.0f}, ATM {market['atm']:.0f}, "
        f"Max Pain {market['max_pain']:.0f} ({market['mp_distance']:+.0f} pts away)."
    )
    s.append(
        f"Market bias: {prob['direction']} "
        f"(Bull {prob['bullish_pct']:.0f}% / Bear {prob['bearish_pct']:.0f}% / "
        f"Side {prob['sideways_pct']:.0f}%), confidence {prob['confidence']}."
    )
    if gex and gex.get("available"):
        flip = gex.get("zero_gamma")
        regime = gex.get("regime")
        regime_word = "pinned / mean-reverting" if regime == "POSITIVE" else "trendy / volatile"
        flip_txt = f", zero-gamma flip ~{flip:.0f}" if flip is not None else ""
        s.append(
            f"Gamma regime: {regime} ({regime_word}){flip_txt}. "
            f"Gamma walls — resistance {gex.get('call_wall'):.0f}, "
            f"support {gex.get('put_wall'):.0f}."
        )
    if exp_range.get("straddle_move"):
        s.append(
            f"ATM straddle implies ~±{exp_range['straddle_move']:.0f} pts by expiry "
            f"(1σ {exp_range['sigma1_lower']:.0f}–{exp_range['sigma1_upper']:.0f})."
        )
    s.append(f"PCR (OI) {pcr['oi']:.2f}, PCR (Vol) {pcr['vol']:.2f}.")
    if levels_res:
        top_r = levels_res[0]
        s.append(
            f"Strongest resistance {top_r['strike']:.0f} "
            f"({top_r['call_oi_lakhs']:.1f}L, {top_r['strength']})."
        )
    if levels_sup:
        top_s = levels_sup[0]
        s.append(
            f"Strongest support {top_s['strike']:.0f} "
            f"({top_s['put_oi_lakhs']:.1f}L, {top_s['strength']})."
        )
    s.append(f"IV skew: {iv['skew_type']} ({iv['skew_degree']:+.1f}).")
    if battlefield:
        s.append(
            f"Battlefield strike {battlefield['strike']:.0f} "
            f"(vol {battlefield['total_vol_lakhs']:.1f}L)."
        )
    s.append(
        f"Expected range {exp_range['expected_lower']:.0f} — "
        f"{exp_range['expected_upper']:.0f}."
    )
    return s


def build_analysis(
    df: pd.DataFrame, expiry: str | None = None, log: bool = True
) -> dict:
    """Run the full pipeline and return an AnalysisResult dict.

    `log` controls whether the prediction is written to the journal (disabled
    for the individual snapshots inside a comparison to avoid double-logging).
    """
    dte, expiry_str = _compute_dte(expiry)

    atm = calculator.get_atm(df)
    spot = _spot_from_atm(df, atm)
    pcr = calculator.get_pcr(df)
    max_pain = calculator.get_max_pain(df)
    mp_distance = round(spot - max_pain, 1)
    iv = calculator.get_iv_skew(df, atm)
    iv_summary = get_iv_summary(df, atm)
    atm_iv = iv_summary.get("atm_iv", 0) or ((iv["atm_call_iv"] + iv["atm_put_iv"]) / 2)
    exp_range = calculator.get_expected_range(df, spot, atm_iv, dte, atm)
    exp_range["max_pain"] = float(max_pain)

    # Gamma exposure: regime, zero-gamma flip, gamma walls.
    gex = compute_gex(df, spot, dte)
    gex_sig = gex_signal(gex, spot)

    resistance = oi_analysis.get_resistance_levels(df, spot)
    support = oi_analysis.get_support_levels(df, spot)
    res_zones = oi_analysis.get_oi_zones(df, "call", spot)
    sup_zones = oi_analysis.get_oi_zones(df, "put", spot)
    battlefield = oi_analysis.get_battlefield(df)
    atm_patterns = oi_analysis.get_atm_zone_patterns(df, atm)
    greeks = estimate_atm_greeks(df, atm, spot, dte)

    top_call_oi = resistance[0]["call_oi"] if resistance else 0.0
    top_put_oi = support[0]["put_oi"] if support else 0.0

    prob = compute_probability({
        "df": df,
        "atm": atm,
        "spot": spot,
        "max_pain": max_pain,
        "pcr": pcr,
        "iv": iv,
        "dte": dte,
        "top_call_oi": top_call_oi,
        "top_put_oi": top_put_oi,
        "gex_sig": gex_sig,
    })

    alignment = compute_alignment(prob.get("parameter_scores", []), gex_sig)

    strategy = suggest_strategy(
        prob,
        {"resistance": resistance, "support": support, "iv_summary": iv_summary},
        atm, df, dte,
    )

    market = {
        "spot": float(spot),
        "atm": float(atm),
        "max_pain": float(max_pain),
        "mp_distance": float(mp_distance),
        "dte": int(dte),
        "expiry": expiry_str,
    }

    summary = _build_summary(
        market, pcr, prob, iv, resistance, support, battlefield, exp_range, gex
    )

    if log:
        journal.record_prediction(
            spot, prob.get("direction", "SIDEWAYS"),
            prob.get("weighted_score", 0.0), expiry_str,
        )

    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "market": market,
        "pcr": pcr,
        "iv": {**iv, "summary": iv_summary},
        "greeks": greeks,
        "gamma": gex,
        "probability": prob,
        "alignment": alignment,
        "resistance": resistance,
        "support": support,
        "sr_zones": {"resistance": res_zones, "support": sup_zones},
        "battlefield": battlefield,
        "atm_patterns": atm_patterns,
        "expected_range": exp_range,
        "strategy": strategy,
        "oi_chart_data": _oi_chart_data(df),
        "summary": summary,
    }


def build_comparison(
    df1: pd.DataFrame, df2: pd.DataFrame, expiry: str | None = None
) -> dict:
    """Compare two snapshots (older=df1, newer=df2)."""
    snap1 = build_analysis(df1, expiry, log=False)
    snap2 = build_analysis(df2, expiry, log=False)

    nifty_move = round(snap2["market"]["spot"] - snap1["market"]["spot"], 1)
    pcr_change = round(snap2["pcr"]["oi"] - snap1["pcr"]["oi"], 3)
    max_pain_shift = round(snap2["market"]["max_pain"] - snap1["market"]["max_pain"], 1)
    call_oi_change = round(
        snap2["pcr"]["total_call_oi"] - snap1["pcr"]["total_call_oi"], 1
    )
    put_oi_change = round(
        snap2["pcr"]["total_put_oi"] - snap1["pcr"]["total_put_oi"], 1
    )

    dir1 = snap1["probability"]["direction"]
    dir2 = snap2["probability"]["direction"]
    sentiment_shift = f"{dir1} -> {dir2}" if dir1 != dir2 else f"{dir2} (unchanged)"

    # New / strengthened walls.
    res1 = {r["strike"] for r in snap1["resistance"]}
    res2 = {r["strike"] for r in snap2["resistance"]}
    sup1 = {s["strike"] for s in snap1["support"]}
    sup2 = {s["strike"] for s in snap2["support"]}
    new_resistances = [r for r in snap2["resistance"] if r["strike"] not in res1]
    new_supports = [s for s in snap2["support"] if s["strike"] not in sup1]

    # OI unwinding detection: large negative chng_oi vs snapshot1.
    oi_unwinding = []
    map1_call = {r["strike"]: r for r in snap1["resistance"]}
    for r in snap2["resistance"]:
        prev = map1_call.get(r["strike"])
        if prev and (r["call_oi"] - prev["call_oi"]) < -50000:
            drop = r["call_oi"] - prev["call_oi"]
            oi_unwinding.append({
                "strike": r["strike"],
                "type": "CALL",
                "oi_change": round(drop, 0),
                "note": f"{r['strike']:.0f} CALL: {drop/1000:.0f}K OI — short covering / squeeze risk",
            })
    map1_put = {s["strike"]: s for s in snap1["support"]}
    for s in snap2["support"]:
        prev = map1_put.get(s["strike"])
        if prev and (s["put_oi"] - prev["put_oi"]) < -50000:
            drop = s["put_oi"] - prev["put_oi"]
            oi_unwinding.append({
                "strike": s["strike"],
                "type": "PUT",
                "oi_change": round(drop, 0),
                "note": f"{s['strike']:.0f} PUT: {drop/1000:.0f}K OI — support unwinding",
            })

    obs = []
    obs.append(
        f"NIFTY moved {nifty_move:+.0f} pts between snapshots."
    )
    obs.append(
        f"PCR shifted {snap1['pcr']['oi']:.2f} -> {snap2['pcr']['oi']:.2f} "
        f"({pcr_change:+.2f})."
    )
    if dir1 != dir2:
        obs.append(f"Sentiment reversal: {dir1} -> {dir2}.")
    if max_pain_shift:
        obs.append(
            f"Max Pain shifted {snap1['market']['max_pain']:.0f} -> "
            f"{snap2['market']['max_pain']:.0f}."
        )
    obs.append(
        f"Total CALL OI changed {call_oi_change/1e5:+.1f}L, "
        f"PUT OI changed {put_oi_change/1e5:+.1f}L."
    )
    if oi_unwinding:
        obs.append(f"{len(oi_unwinding)} significant OI unwinding event(s) detected.")

    return {
        "snapshot1": snap1,
        "snapshot2": snap2,
        "changes": {
            "nifty_move": nifty_move,
            "pcr_change": pcr_change,
            "max_pain_shift": max_pain_shift,
            "call_oi_change": call_oi_change,
            "put_oi_change": put_oi_change,
            "sentiment_shift": sentiment_shift,
            "new_resistances": new_resistances,
            "new_supports": new_supports,
            "oi_unwinding": oi_unwinding,
            "key_observations": obs,
        },
    }
