"""Probability scoring engine: 9 weighted parameters -> directional bias."""

import math

import pandas as pd

from app.option.config import ATM_ZONE_RANGE, PROBABILITY_WEIGHTS
from app.option.core.calculator import get_oi_pattern


def _signal(score: float) -> str:
    if score > 10:
        return "BULLISH"
    if score < -10:
        return "BEARISH"
    return "NEUTRAL"


def _clamp(value: float, lo: float = -100.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _percentages(weighted_score: float) -> tuple[float, float, float]:
    """Convert a [-100, 100] weighted score to (bullish, bearish, sideways) %
    via a symmetric softmax. All three logits are exactly 0 at
    weighted_score == 0, so that case lands on a true even three-way split
    (and therefore SIDEWAYS as the argmax direction), instead of a
    hard-coded bullish-leaning baseline. As |score| grows, the matching
    directional logit rises while the sideways logit (driven by |score|
    alone) falls — weak signals naturally favor sideways and strong signals
    dominate, with no special-cased late "boost" step and no discontinuity
    anywhere.
    """
    s = _clamp(weighted_score)
    bull_logit = s / 60.0
    bear_logit = -s / 60.0
    side_logit = -abs(s) / 100.0
    exps = {
        "BULLISH": math.exp(bull_logit),
        "BEARISH": math.exp(bear_logit),
        "SIDEWAYS": math.exp(side_logit),
    }
    total_exp = sum(exps.values())
    return (
        exps["BULLISH"] / total_exp * 100,
        exps["BEARISH"] / total_exp * 100,
        exps["SIDEWAYS"] / total_exp * 100,
    )


# ── Individual parameter scorers ─────────────────────────────────────────────

def _score_pcr(pcr_oi: float) -> dict:
    if pcr_oi < 0.70:
        score, meaning = -80, "Extreme bearish, heavy CALL buying"
    elif pcr_oi < 0.85:
        score, meaning = -50, "Bearish sentiment, CALL buyers active"
    elif pcr_oi < 0.95:
        score, meaning = -20, "Slight bearish lean"
    elif pcr_oi <= 1.05:
        score, meaning = 0, "Neutral, balanced OI"
    elif pcr_oi <= 1.20:
        score, meaning = 30, "Slight bullish, PUT writers active"
    elif pcr_oi <= 1.40:
        score, meaning = 60, "Bullish, strong PUT writing below"
    else:
        score, meaning = 80, "Extreme bullish, massive PUT support"
    return {
        "key": "pcr",
        "name": "PCR (OI)",
        "value": f"{pcr_oi:.2f}",
        "raw_value": round(pcr_oi, 3),
        "score": float(score),
        "weight": PROBABILITY_WEIGHTS["pcr"],
        "signal": _signal(score),
        "meaning": meaning,
    }


def _score_max_pain(spot: float, max_pain: float) -> dict:
    distance = spot - max_pain
    # Bucketed on % of spot (not fixed index points) so this scales the same
    # way for any underlying/index level, not just ~25,000-level NIFTY.
    pct = (distance / spot * 100) if spot else 0.0
    if pct > 0.8:
        score, meaning = -70, "Spot far above Max Pain, strong pull down"
    elif pct > 0.4:
        score, meaning = -40, "Spot above Max Pain, pull down"
    elif pct > 0.2:
        score, meaning = -20, "Spot slightly above, mild pull down"
    elif pct >= -0.2:
        score, meaning = 0, "Spot near Max Pain, likely to stay"
    elif pct >= -0.4:
        score, meaning = 20, "Spot slightly below, mild pull up"
    elif pct >= -0.8:
        score, meaning = 40, "Spot below Max Pain, pull up"
    else:
        score, meaning = 70, "Spot far below Max Pain, pull up likely"
    return {
        "key": "max_pain",
        "name": "Max Pain Distance",
        "value": f"{distance:+.0f} pts",
        "raw_value": round(distance, 1),
        "score": float(score),
        "weight": PROBABILITY_WEIGHTS["max_pain"],
        "signal": _signal(score),
        "meaning": meaning,
    }


def _score_oi_pattern(df: pd.DataFrame, atm: float) -> dict:
    zone = df[(df["strike"] >= atm - ATM_ZONE_RANGE) & (df["strike"] <= atm + ATM_ZONE_RANGE)]
    raw = 0
    for _, row in zone.iterrows():
        c_pat = get_oi_pattern(row["c_chng_oi"], row["c_chng"])
        p_pat = get_oi_pattern(row["p_chng_oi"], row["p_chng"])
        # CALL side
        if c_pat == "LONG BUILD":
            raw += 2
        elif c_pat == "SHORT BUILD":
            raw -= 1
        elif c_pat == "SHORT COVER":
            raw += 1
        elif c_pat == "LONG UNWIND":
            raw -= 2
        # PUT side
        if p_pat == "LONG BUILD":
            raw += 2
        elif p_pat == "SHORT BUILD":
            raw += 1
        elif p_pat == "SHORT COVER":
            raw -= 1
        elif p_pat == "LONG UNWIND":
            raw -= 2

    # Normalize: max magnitude per row is ~4 (2 sides x 2).
    max_possible = max(len(zone) * 4, 1)
    score = _clamp(raw / max_possible * 100)
    return {
        "key": "oi_pattern",
        "name": "OI Pattern (ATM zone)",
        "value": f"net {raw:+d}",
        "raw_value": float(raw),
        "score": round(float(score), 1),
        "weight": PROBABILITY_WEIGHTS["oi_pattern"],
        "signal": _signal(score),
        "meaning": "Net build-up direction across ATM +/- 300 strikes",
    }


def _score_call_writing(df: pd.DataFrame, atm: float, total_oi: float) -> dict:
    zone = df[(df["strike"] >= atm) & (df["strike"] <= atm + ATM_ZONE_RANGE)]
    fresh = zone[(zone["c_chng_oi"] > 0) & (zone["c_chng"] < 0)]["c_chng_oi"].sum()
    frac = fresh / total_oi if total_oi else 0.0
    # High fresh call writing => strong ceiling => bearish.
    if frac > 0.05:
        score = -60
    elif frac > 0.02:
        score = -35
    else:
        score = 0  # no meaningful fresh writing detected => no signal, not a baked-in bearish tilt
    return {
        "key": "call_writing",
        "name": "CALL Writing Intensity",
        "value": f"{fresh / 1e5:.1f} L",
        "raw_value": float(fresh),
        "score": float(score),
        "weight": PROBABILITY_WEIGHTS["call_writing"],
        "signal": _signal(score),
        "meaning": "Fresh CALL OI above ATM building a ceiling",
    }


def _score_put_writing(df: pd.DataFrame, atm: float, total_oi: float) -> dict:
    zone = df[(df["strike"] >= atm - ATM_ZONE_RANGE) & (df["strike"] <= atm)]
    fresh = zone[(zone["p_chng_oi"] > 0) & (zone["p_chng"] < 0)]["p_chng_oi"].sum()
    frac = fresh / total_oi if total_oi else 0.0
    # High fresh put writing => strong floor => bullish.
    if frac > 0.05:
        score = 60
    elif frac > 0.02:
        score = 35
    else:
        score = 0  # no meaningful fresh writing detected => no signal, not a baked-in bullish tilt
    return {
        "key": "put_writing",
        "name": "PUT Writing Intensity",
        "value": f"{fresh / 1e5:.1f} L",
        "raw_value": float(fresh),
        "score": float(score),
        "weight": PROBABILITY_WEIGHTS["put_writing"],
        "signal": _signal(score),
        "meaning": "Fresh PUT OI below ATM building a floor",
    }


def _score_iv_skew(iv: dict) -> dict:
    degree = iv.get("skew_degree", 0.0)  # otm_put_iv - otm_call_iv
    skew_type = iv.get("skew_type", "FLAT")
    if skew_type == "NORMAL":
        score = _clamp(-min(abs(degree), 10) / 10 * 20)
    elif skew_type == "REVERSE":
        score = _clamp(min(abs(degree), 10) / 10 * 20)
    else:
        score = 0.0
    return {
        "key": "iv_skew",
        "name": "IV Skew",
        "value": f"{skew_type} ({degree:+.1f})",
        "raw_value": float(degree),
        "score": round(float(score), 1),
        "weight": PROBABILITY_WEIGHTS["iv_skew"],
        "signal": _signal(score),
        "meaning": "Put vs call IV richness signals downside/upside fear",
    }


def _score_volume_ratio(pcr_vol: float) -> dict:
    if pcr_vol < 0.80:
        score = -20
    elif pcr_vol <= 1.20:
        score = 0
    else:
        score = 20
    return {
        "key": "volume_ratio",
        "name": "Volume Ratio (PCR Vol)",
        "value": f"{pcr_vol:.2f}",
        "raw_value": round(pcr_vol, 3),
        "score": float(score),
        "weight": PROBABILITY_WEIGHTS["volume_ratio"],
        "signal": _signal(score),
        "meaning": "Intraday traded put/call volume balance",
    }


def _score_res_sup_ratio(top_call_oi: float, top_put_oi: float) -> dict:
    ratio = top_call_oi / top_put_oi if top_put_oi else 1.0
    if ratio > 1.5:
        score = -20
    elif ratio < 0.7:
        score = 20
    else:
        score = 0
    return {
        "key": "resistance_support_ratio",
        "name": "Resistance/Support Ratio",
        "value": f"{ratio:.2f}",
        "raw_value": round(ratio, 3),
        "score": float(score),
        "weight": PROBABILITY_WEIGHTS["resistance_support_ratio"],
        "signal": _signal(score),
        "meaning": "Strongest call wall vs strongest put wall",
    }


def _score_gex(gex_sig: dict | None) -> dict:
    if not gex_sig:
        raise ValueError("no GEX signal")
    score = float(gex_sig.get("score", 0.0))
    return {
        "key": "gex",
        "name": "Gamma Exposure (GEX)",
        "value": gex_sig.get("note", "—"),
        "raw_value": score,
        "score": round(score, 1),
        "weight": PROBABILITY_WEIGHTS["gex"],
        "signal": gex_sig.get("signal", _signal(score)),
        "meaning": "Dealer gamma regime and spot position vs the zero-gamma flip",
    }


def _score_dte(dte: int, max_pain_score: float) -> tuple:
    """Returns (param_dict, adjusted_max_pain_score, sideways_factor).

    Near expiry, pinning strengthens (Max Pain score is amplified) and
    directional conviction should *fade toward sideways* — so we shrink the
    final score by `sideways_factor` (< 1) rather than nudging it bearish.
    The DTE parameter itself stays directionally neutral.
    """
    if dte <= 3:
        adj_mp = max_pain_score * 2.0
        sideways_factor = 0.75
        meaning = "Expiry near: Max Pain pull strong, conviction fades to sideways"
    elif dte <= 7:
        adj_mp = max_pain_score * 1.5
        sideways_factor = 0.9
        meaning = "Mid expiry: Max Pain influence elevated"
    else:
        adj_mp = max_pain_score
        sideways_factor = 1.0
        meaning = "Ample time to expiry, no Max Pain boost"
    param = {
        "key": "dte_effect",
        "name": "DTE Effect",
        "value": f"{dte} days",
        "raw_value": float(dte),
        "score": 0.0,  # neutral: DTE shapes pinning/conviction, not direction
        "weight": PROBABILITY_WEIGHTS["dte_effect"],
        "signal": "NEUTRAL",
        "meaning": meaning,
    }
    return param, adj_mp, sideways_factor


# ── Engine ───────────────────────────────────────────────────────────────────

def compute_probability(data: dict) -> dict:
    """Run all 9 parameters and synthesize a directional probability.

    `data` keys expected: df, atm, spot, max_pain, pcr (dict), iv (dict),
    dte, top_call_oi, top_put_oi.
    """
    df = data["df"]
    atm = data["atm"]
    spot = data["spot"]
    pcr = data["pcr"]
    iv = data["iv"]
    dte = data["dte"]

    total_oi = float(df["c_oi"].sum() + df["p_oi"].sum()) or 1.0

    params = []
    reasoning = []

    # Build each parameter, tolerating individual failures.
    def _try(fn, fallback_name):
        try:
            return fn()
        except Exception as exc:  # keep analysis alive
            reasoning.append(f"{fallback_name} skipped: {exc}")
            return None

    p_pcr = _try(lambda: _score_pcr(pcr["oi"]), "PCR")
    p_mp = _try(lambda: _score_max_pain(spot, data["max_pain"]), "Max Pain")
    p_oi = _try(lambda: _score_oi_pattern(df, atm), "OI Pattern")
    p_cw = _try(lambda: _score_call_writing(df, atm, total_oi), "Call Writing")
    p_pw = _try(lambda: _score_put_writing(df, atm, total_oi), "Put Writing")
    p_iv = _try(lambda: _score_iv_skew(iv), "IV Skew")
    p_vr = _try(lambda: _score_volume_ratio(pcr["vol"]), "Volume Ratio")
    p_rs = _try(
        lambda: _score_res_sup_ratio(data["top_call_oi"], data["top_put_oi"]),
        "Res/Sup Ratio",
    )
    p_gex = _try(lambda: _score_gex(data.get("gex_sig")), "Gamma (GEX)")

    mp_score = p_mp["score"] if p_mp else 0.0
    p_dte, adj_mp_score, sideways_factor = _score_dte(dte, mp_score)

    # Apply the DTE multiplier to the Max Pain contribution.
    if p_mp is not None:
        p_mp = dict(p_mp)
        p_mp["score"] = round(_clamp(adj_mp_score), 1)
        p_mp["signal"] = _signal(p_mp["score"])

    for p in (p_pcr, p_mp, p_oi, p_cw, p_pw, p_iv, p_vr, p_rs, p_gex, p_dte):
        if p is not None:
            params.append(p)

    # Redistribute weight from any skipped parameters proportionally. DTE is
    # excluded from the weight pool entirely: its own score is structurally
    # always 0.0 (it acts through the Max Pain multiplier + sideways_factor
    # below instead), so counting its weight here would only ever dilute the
    # other real-signal parameters without ever contributing anything back.
    scored_params = [p for p in params if p["key"] != "dte_effect"]
    active_weight = sum(p["weight"] for p in scored_params)
    scale = (1.0 / active_weight) if active_weight else 1.0

    weighted_score = 0.0
    for p in scored_params:
        eff_weight = p["weight"] * scale
        contribution = p["score"] * eff_weight
        p["contribution"] = round(contribution, 2)
        weighted_score += contribution
    if p_dte is not None:
        p_dte["contribution"] = 0.0

    # Near expiry, fade directional conviction toward sideways (shrink magnitude).
    weighted_score *= sideways_factor
    weighted_score = _clamp(weighted_score)

    bullish_pct, bearish_pct, sideways_pct = _percentages(weighted_score)

    # Direction from the dominant percentage. SIDEWAYS listed first so that an
    # exact tie (weighted_score == 0 gives all three an identical percentage)
    # resolves to SIDEWAYS — Python's max() returns the first-seen key on a
    # tie, and BULLISH-first ordering would otherwise silently reintroduce a
    # directional bias at precisely the neutral point.
    trio = {
        "SIDEWAYS": sideways_pct,
        "BULLISH": bullish_pct,
        "BEARISH": bearish_pct,
    }
    direction = max(trio, key=trio.get)

    if abs(weighted_score) > 60:
        confidence = "HIGH"
    elif abs(weighted_score) > 30:
        confidence = "MODERATE"
    else:
        confidence = "LOW"

    # Human-readable reasoning from the strongest contributors.
    ranked = sorted(params, key=lambda p: abs(p.get("contribution", 0)), reverse=True)
    for p in ranked[:4]:
        reasoning.append(f"{p['name']}: {p['meaning']} (score {p['score']:+.0f}).")
    reasoning.insert(
        0,
        f"Weighted score {weighted_score:+.1f} => {direction} bias "
        f"with {confidence} confidence.",
    )

    return {
        "bullish_pct": round(bullish_pct, 1),
        "bearish_pct": round(bearish_pct, 1),
        "sideways_pct": round(sideways_pct, 1),
        "weighted_score": round(weighted_score, 1),
        "direction": direction,
        "confidence": confidence,
        "parameter_scores": params,
        "reasoning": reasoning,
    }
