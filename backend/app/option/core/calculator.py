"""Core market calculations: ATM, PCR, Max Pain, OI patterns, IV skew, range."""

import math

import pandas as pd

from app.option.config import OTM_SKEW_BAND


def _safe_div(num: float, den: float, default: float = 0.0) -> float:
    if den is None or den == 0 or pd.isna(den):
        return default
    return num / den


def get_atm(df: pd.DataFrame) -> float:
    """Strike where abs(c_ltp - p_ltp) is minimum (both LTPs > 0).

    Fallback: strike nearest the median of all strikes.
    """
    try:
        valid = df[(df["c_ltp"] > 0) & (df["p_ltp"] > 0)].copy()
        if not valid.empty:
            valid["diff"] = (valid["c_ltp"] - valid["p_ltp"]).abs()
            return float(valid.loc[valid["diff"].idxmin(), "strike"])
    except Exception:
        pass
    # Fallback to median-nearest strike.
    median = df["strike"].median()
    idx = (df["strike"] - median).abs().idxmin()
    return float(df.loc[idx, "strike"])


def get_pcr(df: pd.DataFrame) -> dict:
    """Put-Call Ratio for OI and volume plus underlying totals."""
    total_call_oi = float(df["c_oi"].sum())
    total_put_oi = float(df["p_oi"].sum())
    total_call_vol = float(df["c_vol"].sum())
    total_put_vol = float(df["p_vol"].sum())
    return {
        "oi": round(_safe_div(total_put_oi, total_call_oi), 3),
        "vol": round(_safe_div(total_put_vol, total_call_vol), 3),
        "total_call_oi": total_call_oi,
        "total_put_oi": total_put_oi,
        "total_call_vol": total_call_vol,
        "total_put_vol": total_put_vol,
    }


def get_max_pain(df: pd.DataFrame) -> float:
    """Strike T minimising total option-writer payout."""
    strikes = df["strike"].to_numpy()
    c_oi = df["c_oi"].to_numpy()
    p_oi = df["p_oi"].to_numpy()

    best_strike = float(strikes[0])
    best_pain = None
    for t in strikes:
        call_pain = (c_oi * (t - strikes).clip(min=0)).sum()
        put_pain = (p_oi * (strikes - t).clip(min=0)).sum()
        pain = call_pain + put_pain
        if best_pain is None or pain < best_pain:
            best_pain = pain
            best_strike = float(t)
    return best_strike


def get_oi_pattern(chng_oi: float, price_chng: float) -> str:
    """Classic OI build-up interpretation."""
    oi_up = chng_oi > 0
    price_up = price_chng > 0
    if oi_up and price_up:
        return "LONG BUILD"
    if oi_up and not price_up:
        return "SHORT BUILD"
    if not oi_up and price_up:
        return "SHORT COVER"
    return "LONG UNWIND"


def get_iv_skew(df: pd.DataFrame, atm: float) -> dict:
    """ATM and OTM implied-vol comparison."""
    atm_row = df[df["strike"] == atm]
    atm_call_iv = float(atm_row["c_iv"].iloc[0]) if not atm_row.empty else 0.0
    atm_put_iv = float(atm_row["p_iv"].iloc[0]) if not atm_row.empty else 0.0

    # Sample OTM IV in a band just outside ATM; ignore deep-OTM strikes whose
    # IV/LTP are stale and would distort the skew.
    otm_calls = df[
        (df["strike"] > atm + 200)
        & (df["strike"] <= atm + OTM_SKEW_BAND)
        & (df["c_iv"] > 0)
    ]["c_iv"]
    otm_puts = df[
        (df["strike"] < atm - 200)
        & (df["strike"] >= atm - OTM_SKEW_BAND)
        & (df["p_iv"] > 0)
    ]["p_iv"]
    otm_call_iv = float(otm_calls.mean()) if not otm_calls.empty else 0.0
    otm_put_iv = float(otm_puts.mean()) if not otm_puts.empty else 0.0

    skew_degree = round(otm_put_iv - otm_call_iv, 2)
    if skew_degree > 2:
        skew_type = "NORMAL"
    elif skew_degree < -2:
        skew_type = "REVERSE"
    else:
        skew_type = "FLAT"

    return {
        "atm_call_iv": round(atm_call_iv, 2),
        "atm_put_iv": round(atm_put_iv, 2),
        "otm_call_iv": round(otm_call_iv, 2),
        "otm_put_iv": round(otm_put_iv, 2),
        "skew_type": skew_type,
        "skew_degree": skew_degree,
    }


def get_straddle_move(df: pd.DataFrame, atm: float) -> float:
    """Market-implied 1-sigma move to expiry = ATM straddle price.

    The combined ATM call + put premium is the market's own forecast of how far
    the underlying will travel by expiry, and is usually more reliable than a
    sqrt-of-time IV estimate.
    """
    row = df[df["strike"] == atm]
    if row.empty:
        idx = (df["strike"] - atm).abs().idxmin()
        row = df.loc[[idx]]
    c = float(row["c_ltp"].iloc[0])
    p = float(row["p_ltp"].iloc[0])
    return round(c + p, 2)


def get_expected_range(
    df: pd.DataFrame, spot: float, atm_iv: float, dte: int, atm: float | None = None
) -> dict:
    """Combine IV move, ATM-straddle move and OI walls into an expected range."""
    safe_iv = atm_iv if atm_iv and atm_iv > 0 else 15.0
    daily_move = (safe_iv / 100.0) * spot / math.sqrt(252)
    dte_range = daily_move * math.sqrt(max(dte, 1))
    iv_upper = round(spot + dte_range)
    iv_lower = round(spot - dte_range)

    # Straddle-implied move (1 sigma) and 2-sigma band.
    straddle_move = get_straddle_move(df, atm) if atm is not None else 0.0
    sigma1_upper = round(spot + straddle_move) if straddle_move else iv_upper
    sigma1_lower = round(spot - straddle_move) if straddle_move else iv_lower
    sigma2_upper = round(spot + 2 * straddle_move) if straddle_move else iv_upper
    sigma2_lower = round(spot - 2 * straddle_move) if straddle_move else iv_lower

    # OI walls: strongest call OI above spot, strongest put OI below spot.
    calls_above = df[df["strike"] > spot]
    puts_below = df[df["strike"] < spot]
    if not calls_above.empty:
        oi_upper = float(calls_above.loc[calls_above["c_oi"].idxmax(), "strike"])
    else:
        oi_upper = iv_upper
    if not puts_below.empty:
        oi_lower = float(puts_below.loc[puts_below["p_oi"].idxmax(), "strike"])
    else:
        oi_lower = iv_lower

    expected_upper = min(iv_upper, oi_upper)
    expected_lower = max(iv_lower, oi_lower)

    return {
        "iv_upper": float(iv_upper),
        "iv_lower": float(iv_lower),
        "oi_upper": float(oi_upper),
        "oi_lower": float(oi_lower),
        "expected_upper": float(expected_upper),
        "expected_lower": float(expected_lower),
        "straddle_move": float(straddle_move),
        "sigma1_upper": float(sigma1_upper),
        "sigma1_lower": float(sigma1_lower),
        "sigma2_upper": float(sigma2_upper),
        "sigma2_lower": float(sigma2_lower),
    }
