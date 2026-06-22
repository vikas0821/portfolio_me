"""Lightweight Greeks estimates (no full Black-Scholes calibration)."""

import math

import pandas as pd
from app.option.modules.scipy_stub import norm_cdf, norm_pdf  # no scipy dependency needed


def _bs_greeks(spot, strike, t_years, iv, is_call):
    """Approximate delta/gamma/theta/vega using Black-Scholes (r=0)."""
    if spot <= 0 or strike <= 0 or t_years <= 0 or iv <= 0:
        return {"delta": 0.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0}
    sigma = iv / 100.0
    sqrt_t = math.sqrt(t_years)
    d1 = (math.log(spot / strike) + 0.5 * sigma ** 2 * t_years) / (sigma * sqrt_t)
    d2 = d1 - sigma * sqrt_t
    pdf = norm_pdf(d1)
    if is_call:
        delta = norm_cdf(d1)
    else:
        delta = norm_cdf(d1) - 1
    gamma = pdf / (spot * sigma * sqrt_t)
    vega = spot * pdf * sqrt_t / 100.0
    theta = -(spot * pdf * sigma) / (2 * sqrt_t) / 365.0
    return {
        "delta": round(delta, 4),
        "gamma": round(gamma, 6),
        "theta": round(theta, 4),
        "vega": round(vega, 4),
    }


def estimate_atm_greeks(df: pd.DataFrame, atm: float, spot: float, dte: int) -> dict:
    """Greeks for the ATM call and put."""
    t_years = max(dte, 1) / 365.0
    row = df[df["strike"] == atm]
    if row.empty:
        return {"call": None, "put": None}
    c_iv = float(row["c_iv"].iloc[0]) or 15.0
    p_iv = float(row["p_iv"].iloc[0]) or 15.0
    return {
        "call": _bs_greeks(spot, atm, t_years, c_iv, True),
        "put": _bs_greeks(spot, atm, t_years, p_iv, False),
    }
