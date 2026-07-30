"""IV-focused helpers: IV rank proxy and skew description."""

import pandas as pd


def get_iv_summary(df: pd.DataFrame, atm: float) -> dict:
    """Lightweight IV statistics across the chain.

    Without historical IV we approximate an IV rank from the current
    cross-sectional spread (where ATM IV sits between min and max).
    """
    call_iv = df[df["c_iv"] > 0]["c_iv"]
    put_iv = df[df["p_iv"] > 0]["p_iv"]
    all_iv = pd.concat([call_iv, put_iv])

    atm_row = df[df["strike"] == atm]
    atm_call_iv = float(atm_row["c_iv"].iloc[0]) if not atm_row.empty else 0.0
    atm_put_iv = float(atm_row["p_iv"].iloc[0]) if not atm_row.empty else 0.0
    atm_iv = (atm_call_iv + atm_put_iv) / 2 if (atm_call_iv or atm_put_iv) else 0.0

    iv_min = float(all_iv.min()) if not all_iv.empty else 0.0
    iv_max = float(all_iv.max()) if not all_iv.empty else 0.0
    iv_mean = float(all_iv.mean()) if not all_iv.empty else 0.0

    if iv_max > iv_min:
        iv_rank = round((atm_iv - iv_min) / (iv_max - iv_min) * 100, 1)
    else:
        iv_rank = 0.0

    return {
        "atm_iv": round(atm_iv, 2),
        "iv_min": round(iv_min, 2),
        "iv_max": round(iv_max, 2),
        "iv_mean": round(iv_mean, 2),
        "iv_rank": iv_rank,
        # Named "iv_rank" for convenience but this is NOT the standard
        # historical IV Rank/Percentile (that needs a trailing IV history,
        # which this tool doesn't persist) — it's today's ATM IV positioned
        # between today's own min/max IV across the chain. Kept honest here
        # so any consumer of the raw JSON (not just the Python docstring
        # above) sees the caveat.
        "iv_rank_note": "Same-day cross-sectional proxy, not a historical percentile.",
    }
