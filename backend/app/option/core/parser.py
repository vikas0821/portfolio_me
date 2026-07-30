"""CSV parsing: NSE Option Chain CSV -> clean DataFrame."""

import io

import numpy as np
import pandas as pd

from app.option.config import STRIKE_WINDOW

# Mapping of raw column index -> clean output column name.
COLUMN_MAP = {
    1: "c_oi",
    2: "c_chng_oi",
    3: "c_vol",
    4: "c_iv",
    5: "c_ltp",
    6: "c_chng",
    11: "strike",
    16: "p_chng",
    17: "p_ltp",
    18: "p_iv",
    19: "p_vol",
    20: "p_chng_oi",
    21: "p_oi",
}

OUTPUT_COLUMNS = [
    "strike", "c_oi", "c_chng_oi", "c_vol", "c_iv", "c_ltp", "c_chng",
    "p_oi", "p_chng_oi", "p_vol", "p_iv", "p_ltp", "p_chng",
]


class ParseError(Exception):
    """Raised when the CSV cannot be parsed into a usable DataFrame."""


def _clean_number(value) -> float:
    """Convert a raw cell to float, handling commas, dashes and blanks."""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        if pd.isna(value):
            return 0.0
        return float(value)
    text = str(value).strip()
    if text in ("", "-", "--", "nan", "NaN"):
        return 0.0
    text = text.replace(",", "").replace('"', "")
    try:
        return float(text)
    except ValueError:
        return 0.0


def _validate_header(text: str) -> None:
    """Loose sanity check on the header row (line 2) before trusting column
    *position* for everything downstream. Column mapping in COLUMN_MAP is
    purely positional — a reordered/different NSE export would otherwise be
    read silently (IV into an OI slot, etc.) with no error at all. This
    deliberately checks for a handful of near-universal keywords rather than
    an exact header string, since NSE's own export format has minor variants
    (extra bid/ask columns etc.) that a strict match would false-positive on.
    """
    lines = text.splitlines()
    if len(lines) < 2:
        raise ParseError("CSV has fewer than 2 header rows; this doesn't look like an NSE option-chain export.")
    header_line = lines[1].upper()
    if "STRIKE" not in header_line:
        raise ParseError(
            "Header row doesn't contain a STRIKE column — this doesn't look like an "
            "NSE option-chain export, or the export format has changed."
        )
    if header_line.count("OI") < 2:
        raise ParseError(
            "Header row doesn't have the expected CALL/PUT OI columns — this doesn't "
            "look like an NSE option-chain export, or the export format has changed."
        )
    if header_line.count("IV") < 2:
        raise ParseError(
            "Header row doesn't have the expected CALL/PUT IV columns — this doesn't "
            "look like an NSE option-chain export, or the export format has changed."
        )


def parse_csv(raw_bytes: bytes) -> pd.DataFrame:
    """Parse raw NSE option-chain CSV bytes into a clean DataFrame.

    Row 0 is a CALLS/PUTS banner, row 1 is headers, data starts row 2.
    """
    try:
        text = raw_bytes.decode("utf-8-sig", errors="replace")
    except Exception as exc:  # pragma: no cover - defensive
        raise ParseError(f"Could not decode file: {exc}")

    _validate_header(text)

    try:
        raw = pd.read_csv(
            io.StringIO(text),
            header=None,
            skiprows=2,
            dtype=str,
            engine="python",
            on_bad_lines="skip",
        )
    except Exception as exc:
        raise ParseError(f"Could not read CSV structure: {exc}")

    if raw.empty:
        raise ParseError("CSV contains no data rows.")

    max_idx = max(COLUMN_MAP.keys())
    if raw.shape[1] <= max_idx:
        raise ParseError(
            f"CSV has only {raw.shape[1]} columns; expected at least {max_idx + 1}. "
            "This does not look like an NSE option-chain export."
        )

    data = {}
    for idx, name in COLUMN_MAP.items():
        data[name] = raw.iloc[:, idx].map(_clean_number)

    df = pd.DataFrame(data)[OUTPUT_COLUMNS]

    # Drop rows without a usable strike.
    df = df[df["strike"] > 0]

    # Keep strikes within a window around the ATM, derived from THIS file (works
    # for any underlying/level, not just a fixed 20k-28k NIFTY band). The ATM
    # proxy is the strike where the call and put are closest in price; if no
    # paired prices exist, fall back to the median strike.
    paired = df[(df["c_ltp"] > 0) & (df["p_ltp"] > 0)]
    if not paired.empty:
        center = float(
            paired.loc[(paired["c_ltp"] - paired["p_ltp"]).abs().idxmin(), "strike"]
        )
    else:
        center = float(df["strike"].median())
    lo, hi = center - STRIKE_WINDOW, center + STRIKE_WINDOW
    df = df[(df["strike"] >= lo) & (df["strike"] <= hi)]

    df = df.astype(float)
    df = df.sort_values("strike").reset_index(drop=True)

    if len(df) < 10:
        raise ParseError(
            f"Only {len(df)} valid strike rows found within {STRIKE_WINDOW} pts of "
            f"ATM (~{center:.0f}); need at least 10. Check the file."
        )

    df = df.replace([np.inf, -np.inf], 0.0)
    return df
