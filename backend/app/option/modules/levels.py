"""Nearest support/resistance helpers used by strategy & range logic."""

import pandas as pd


def nearest_resistance_above(df: pd.DataFrame, price: float) -> float:
    """Strongest CALL-OI strike strictly above `price` (fallback: nearest)."""
    above = df[df["strike"] > price]
    if above.empty:
        return float(df["strike"].max())
    # Prefer the high-OI wall; tie-break by proximity.
    wall = above.loc[above["c_oi"].idxmax(), "strike"]
    return float(wall)


def nearest_support_below(df: pd.DataFrame, price: float) -> float:
    """Strongest PUT-OI strike strictly below `price` (fallback: nearest)."""
    below = df[df["strike"] < price]
    if below.empty:
        return float(df["strike"].min())
    wall = below.loc[below["p_oi"].idxmax(), "strike"]
    return float(wall)


def next_strike_above(df: pd.DataFrame, price: float) -> float:
    above = df[df["strike"] > price]["strike"]
    return float(above.min()) if not above.empty else float(df["strike"].max())


def next_strike_below(df: pd.DataFrame, price: float) -> float:
    below = df[df["strike"] < price]["strike"]
    return float(below.max()) if not below.empty else float(df["strike"].min())


def nearest_strike(df: pd.DataFrame, target: float) -> float:
    """The listed strike closest to `target` (so legs use real strikes)."""
    idx = (df["strike"] - target).abs().idxmin()
    return float(df.loc[idx, "strike"])


def ltp_at(df: pd.DataFrame, strike: float, side: str) -> float:
    """LTP for a given strike. side = 'c' or 'p'."""
    row = df[df["strike"] == strike]
    if row.empty:
        # nearest strike fallback
        idx = (df["strike"] - strike).abs().idxmin()
        row = df.loc[[idx]]
    col = "c_ltp" if side == "c" else "p_ltp"
    return float(row[col].iloc[0])
