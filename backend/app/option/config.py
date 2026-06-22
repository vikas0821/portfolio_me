"""Central configuration: constants and probability weights."""

LOT_SIZE = 75
UNDERLYING = "NIFTY"
# Keep strikes within +/- this many points of the ATM (derived per file), so the
# tool works for any underlying/level instead of a fixed band. Also acts as a
# sanity filter dropping spurious far-strike rows.
STRIKE_WINDOW = 2500
ATM_ZONE_RANGE = 300
DEFAULT_DTE = 7

# Cap suggested debit-spread width so the sold leg isn't an impractically far wall.
MAX_SPREAD_WIDTH = 500
# Ignore IV beyond this distance from ATM when measuring skew (deep OTM is stale).
OTM_SKEW_BAND = 1500

# Weight assigned to each probability parameter. The engine renormalizes active
# weights, so adding/removing one (e.g. when data is missing) stays consistent.
PROBABILITY_WEIGHTS = {
    "pcr": 0.20,
    "max_pain": 0.15,
    "oi_pattern": 0.20,
    "call_writing": 0.10,
    "put_writing": 0.10,
    "iv_skew": 0.10,
    "volume_ratio": 0.05,
    "resistance_support_ratio": 0.05,
    "dte_effect": 0.05,
    # GEX is mainly a *regime* signal (pinned vs trendy); it gets only a mild
    # directional weight since "above the flip" means stable, not necessarily up.
    "gex": 0.08,
}

# OI strength thresholds expressed as fraction of total side OI.
STRENGTH_THRESHOLDS = {
    "very_strong": 0.15,
    "strong": 0.10,
    "moderate": 0.05,
    "weak": 0.00,
}

# CORS origins allowed by the API.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
