"""Gamma Exposure (GEX) analysis.

Computes dealer gamma exposure per strike, the net GEX (market regime), the
zero-gamma flip level, and the dominant gamma walls (the strongest, most
reliable support/resistance because they mark where dealers must hedge).

Sign convention (common retail / SqueezeMetrics style):
  dealers are assumed LONG call gamma and SHORT put gamma, so
    call strikes contribute  +gamma * OI
    put  strikes contribute  -gamma * OI
  Net GEX > 0  -> dealers dampen moves   -> price PINNED / mean-reverting.
  Net GEX < 0  -> dealers amplify moves  -> TRENDY / breakout-prone.
"""

import math

import pandas as pd

from app.option.config import LOT_SIZE
from app.option.modules.scipy_stub import norm_pdf


def _bs_gamma(spot: float, strike: float, t_years: float, iv_pct: float) -> float:
    """Black-Scholes gamma (r=0). Returns 0 for degenerate inputs."""
    if spot <= 0 or strike <= 0 or t_years <= 0:
        return 0.0
    sigma = (iv_pct or 0) / 100.0
    if sigma <= 0:
        sigma = 0.15  # fall back to a sane IV when the cell is blank
    sqrt_t = math.sqrt(t_years)
    try:
        d1 = (math.log(spot / strike) + 0.5 * sigma ** 2 * t_years) / (sigma * sqrt_t)
    except ValueError:
        return 0.0
    return norm_pdf(d1) / (spot * sigma * sqrt_t)


def _gex_at(price: float, df: pd.DataFrame, t_years: float) -> float:
    """Net dealer GEX (notional per 1% move) evaluated at a hypothetical price."""
    total = 0.0
    scale = price * price * 0.01 * LOT_SIZE
    for _, r in df.iterrows():
        g_call = _bs_gamma(price, r["strike"], t_years, r["c_iv"])
        g_put = _bs_gamma(price, r["strike"], t_years, r["p_iv"])
        total += scale * (g_call * r["c_oi"] - g_put * r["p_oi"])
    return total


def _find_zero_gamma(df: pd.DataFrame, t_years: float, spot: float) -> float | None:
    """Locate the price where net GEX flips sign (the gamma-flip level).

    Scans a fine grid across the strike range and linearly interpolates the
    first sign change. Returns None if GEX never crosses zero.
    """
    lo = float(df["strike"].min())
    hi = float(df["strike"].max())
    if hi <= lo:
        return None
    steps = 60
    prev_p = lo
    prev_v = _gex_at(lo, df, t_years)
    for i in range(1, steps + 1):
        p = lo + (hi - lo) * i / steps
        v = _gex_at(p, df, t_years)
        if prev_v == 0:
            return round(prev_p)
        if (prev_v < 0) != (v < 0):  # sign change between prev_p and p
            # Linear interpolation for the crossing.
            frac = abs(prev_v) / (abs(prev_v) + abs(v)) if (abs(prev_v) + abs(v)) else 0.5
            return round(prev_p + (p - prev_p) * frac)
        prev_p, prev_v = p, v
    return None


def compute_gex(df: pd.DataFrame, spot: float, dte: int) -> dict:
    """Full GEX summary for the chain.

    Returns net GEX, regime, zero-gamma flip level, call/put gamma walls, the
    strongest gamma magnet, and a per-strike profile for charting.
    """
    try:
        t_years = max(dte, 1) / 365.0
        scale = spot * spot * 0.01 * LOT_SIZE

        profile = []
        net = 0.0
        for _, r in df.iterrows():
            g_call = _bs_gamma(spot, r["strike"], t_years, r["c_iv"])
            g_put = _bs_gamma(spot, r["strike"], t_years, r["p_iv"])
            call_gex = scale * g_call * r["c_oi"]
            put_gex = -scale * g_put * r["p_oi"]
            strike_net = call_gex + put_gex
            net += strike_net
            profile.append({
                "strike": float(r["strike"]),
                "call_gex": call_gex,
                "put_gex": put_gex,
                "net_gex": strike_net,
                # absolute gamma*OI used to rank walls (sign-independent magnet)
                "call_gamma_oi": g_call * r["c_oi"],
                "put_gamma_oi": g_put * r["p_oi"],
            })

        if not profile:
            return _empty()

        # Walls: heaviest call-gamma strike above spot = resistance; heaviest
        # put-gamma strike below spot = support.
        above = [p for p in profile if p["strike"] >= spot] or profile
        below = [p for p in profile if p["strike"] <= spot] or profile
        call_wall = max(above, key=lambda p: p["call_gamma_oi"])
        put_wall = max(below, key=lambda p: p["put_gamma_oi"])
        magnet = max(profile, key=lambda p: abs(p["net_gex"]))

        zero_gamma = _find_zero_gamma(df, t_years, spot)
        regime = "POSITIVE" if net >= 0 else "NEGATIVE"

        # Qualitative strength relative to the largest single-strike contribution,
        # which is far more intuitive than the raw notional.
        peak = max((abs(p["net_gex"]) for p in profile), default=0.0) or 1.0
        ratio = abs(net) / (peak * max(len(profile), 1))
        if ratio > 0.5:
            strength = "STRONG"
        elif ratio > 0.2:
            strength = "MODERATE"
        else:
            strength = "MILD"
        net_label = f"{strength} {'POSITIVE' if net >= 0 else 'NEGATIVE'}"

        # Scale to readable units (₹ Cr per 1% move) for display.
        div = 1e7
        prof_scaled = [
            {
                "strike": p["strike"],
                "call_gex": round(p["call_gex"] / div, 3),
                "put_gex": round(p["put_gex"] / div, 3),
                "net_gex": round(p["net_gex"] / div, 3),
            }
            for p in profile
        ]

        if regime == "POSITIVE":
            interpretation = (
                "Positive gamma: dealers dampen moves. Expect mean-reversion and "
                "pinning toward high-gamma strikes; ranges tend to hold."
            )
        else:
            interpretation = (
                "Negative gamma: dealers amplify moves. Expect trending / volatile "
                "action; breakouts run further. Watch the zero-gamma flip."
            )

        return {
            "available": True,
            "net_gex_cr": round(net / div, 2),
            "net_label": net_label,
            "regime": regime,
            "zero_gamma": float(zero_gamma) if zero_gamma is not None else None,
            "spot_vs_flip": (
                round(spot - zero_gamma, 1) if zero_gamma is not None else None
            ),
            "call_wall": call_wall["strike"],
            "put_wall": put_wall["strike"],
            "magnet": magnet["strike"],
            "interpretation": interpretation,
            "profile": prof_scaled,
        }
    except Exception as exc:  # never crash the analysis
        out = _empty()
        out["error"] = str(exc)
        return out


def _empty() -> dict:
    return {
        "available": False,
        "net_gex_cr": None,
        "net_label": None,
        "regime": None,
        "zero_gamma": None,
        "spot_vs_flip": None,
        "call_wall": None,
        "put_wall": None,
        "magnet": None,
        "interpretation": "Gamma exposure unavailable (missing IV data).",
        "profile": [],
    }


def gex_signal(gex: dict, spot: float) -> dict:
    """Translate the regime + flip position into a directional signal.

    Used by the probability engine and the alignment meter.
    """
    if not gex or not gex.get("available"):
        return {"score": 0.0, "signal": "NEUTRAL", "note": "No GEX data"}

    flip = gex.get("zero_gamma")
    regime = gex.get("regime")

    # GEX is primarily a *regime* read (pinned vs trendy), NOT a strong direction
    # signal — sitting above the flip means stability, not "up". So we only apply
    # a *mild* tilt from how far spot sits beyond the flip, capped tightly.
    score = 0.0
    if flip is not None:
        dist = spot - flip
        score = max(-25.0, min(25.0, dist / 8.0))

    if score > 8:
        sig = "BULLISH"
    elif score < -8:
        sig = "BEARISH"
    else:
        sig = "NEUTRAL"

    note = (
        f"{regime} gamma; spot {'above' if (flip is not None and spot >= flip) else 'below'} "
        f"flip {flip}" if flip is not None else f"{regime} gamma"
    )
    return {"score": round(score, 1), "signal": sig, "note": note}
