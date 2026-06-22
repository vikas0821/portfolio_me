"""Open-Interest analysis: resistance/support levels, zones, battlefield, patterns.

Levels are ranked by a *weighted* score (raw OI adjusted for fresh OI change):
fresh writing strengthens a wall, unwinding weakens it. Each level is tagged
FRESH / STABLE / WEAKENING and annotated with its distance from spot. Adjacent
strong strikes are additionally clustered into support/resistance *zones*.
"""

import pandas as pd

from app.option.config import ATM_ZONE_RANGE, STRENGTH_THRESHOLDS
from app.option.core.calculator import get_oi_pattern


def _strength(fraction: float) -> tuple:
    """Return (label, pct) given OI fraction of the side total."""
    pct = round(fraction * 100, 1)
    if fraction > STRENGTH_THRESHOLDS["very_strong"]:
        return "VERY STRONG", pct
    if fraction > STRENGTH_THRESHOLDS["strong"]:
        return "STRONG", pct
    if fraction > STRENGTH_THRESHOLDS["moderate"]:
        return "MODERATE", pct
    return "WEAK", pct


def _freshness(oi: float, chng_oi: float) -> tuple:
    """Return (weight_factor, tag) reflecting fresh writing vs unwinding."""
    if oi <= 0:
        return 1.0, "STABLE"
    frac = chng_oi / oi
    frac = max(-0.5, min(0.5, frac))
    factor = 1.0 + frac  # 0.5x (heavy unwind) .. 1.5x (heavy fresh writing)
    if chng_oi > 0.10 * oi:
        tag = "FRESH"
    elif chng_oi < -0.10 * oi:
        tag = "WEAKENING"
    else:
        tag = "STABLE"
    return factor, tag


def _level_row(row, side: str, total_oi: float, spot: float | None) -> dict:
    oi = float(row["c_oi"] if side == "call" else row["p_oi"])
    chng = float(row["c_chng_oi"] if side == "call" else row["p_chng_oi"])
    ltp = float(row["c_ltp"] if side == "call" else row["p_ltp"])
    pat_chng = float(row["c_chng"] if side == "call" else row["p_chng"])
    frac = oi / total_oi if total_oi else 0.0
    label, pct = _strength(frac)
    factor, tag = _freshness(oi, chng)
    strike = float(row["strike"])
    out = {
        "strike": strike,
        "chng_oi": chng,
        "ltp": ltp,
        "pattern": get_oi_pattern(chng, pat_chng),
        "strength": label,
        "strength_pct": pct,
        "weighted_score": round(oi * factor, 0),
        "freshness": tag,
    }
    if side == "call":
        out["call_oi"] = oi
        out["call_oi_lakhs"] = round(oi / 1e5, 2)
    else:
        out["put_oi"] = oi
        out["put_oi_lakhs"] = round(oi / 1e5, 2)
    if spot:
        out["distance"] = round(strike - spot, 1)
        out["distance_pct"] = round((strike - spot) / spot * 100, 2)
    return out


def get_resistance_levels(df: pd.DataFrame, spot: float | None = None) -> list:
    """Top 5 CALL walls ranked by fresh-OI-weighted score."""
    total = float(df["c_oi"].sum()) or 1.0
    rows = [_level_row(r, "call", total, spot) for _, r in df.iterrows()]
    rows.sort(key=lambda x: x["weighted_score"], reverse=True)
    return rows[:5]


def get_support_levels(df: pd.DataFrame, spot: float | None = None) -> list:
    """Top 5 PUT walls ranked by fresh-OI-weighted score."""
    total = float(df["p_oi"].sum()) or 1.0
    rows = [_level_row(r, "put", total, spot) for _, r in df.iterrows()]
    rows.sort(key=lambda x: x["weighted_score"], reverse=True)
    return rows[:5]


def get_oi_zones(df: pd.DataFrame, side: str, spot: float | None = None) -> list:
    """Cluster adjacent high-OI strikes into support/resistance zones.

    A 'strong' strike is one whose OI exceeds (mean + 0.5*std) for its side.
    Consecutive strong strikes merge into a single zone; zones are ranked by
    combined OI. Returns up to 3 zones.
    """
    col = "c_oi" if side == "call" else "p_oi"
    d = df.sort_values("strike").reset_index(drop=True)
    oi = d[col]
    if oi.sum() <= 0:
        return []
    threshold = oi.mean() + 0.5 * oi.std(ddof=0)

    zones = []
    cur = None
    for _, r in d.iterrows():
        strong = r[col] >= threshold and r[col] > 0
        if strong:
            if cur is None:
                cur = {"low": r["strike"], "high": r["strike"], "total_oi": r[col]}
            else:
                cur["high"] = r["strike"]
                cur["total_oi"] += r[col]
        else:
            if cur is not None:
                zones.append(cur)
                cur = None
    if cur is not None:
        zones.append(cur)

    zones.sort(key=lambda z: z["total_oi"], reverse=True)
    out = []
    for z in zones[:3]:
        center = (z["low"] + z["high"]) / 2
        item = {
            "low": float(z["low"]),
            "high": float(z["high"]),
            "center": float(center),
            "total_oi": float(z["total_oi"]),
            "total_oi_lakhs": round(z["total_oi"] / 1e5, 2),
            "width": float(z["high"] - z["low"]),
        }
        if spot:
            item["distance"] = round(center - spot, 1)
        out.append(item)
    return out


def get_battlefield(df: pd.DataFrame) -> dict:
    """Strike with the highest combined call+put volume."""
    vol = df["c_vol"] + df["p_vol"]
    idx = vol.idxmax()
    row = df.loc[idx]
    total = float(row["c_vol"] + row["p_vol"])
    return {
        "strike": float(row["strike"]),
        "total_vol": total,
        "total_vol_lakhs": round(total / 1e5, 2),
        "c_vol": float(row["c_vol"]),
        "p_vol": float(row["p_vol"]),
    }


def get_atm_zone_patterns(df: pd.DataFrame, atm: float) -> list:
    """OI build-up patterns for each strike in the ATM +/- 300 zone."""
    zone = df[(df["strike"] >= atm - ATM_ZONE_RANGE) & (df["strike"] <= atm + ATM_ZONE_RANGE)]
    out = []
    for _, row in zone.iterrows():
        out.append({
            "strike": float(row["strike"]),
            "c_pattern": get_oi_pattern(row["c_chng_oi"], row["c_chng"]),
            "p_pattern": get_oi_pattern(row["p_chng_oi"], row["p_chng"]),
            "c_ltp": float(row["c_ltp"]),
            "p_ltp": float(row["p_ltp"]),
            "c_chng_oi": float(row["c_chng_oi"]),
            "p_chng_oi": float(row["p_chng_oi"]),
            "is_atm": bool(row["strike"] == atm),
        })
    return out
