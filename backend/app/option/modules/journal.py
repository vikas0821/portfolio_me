"""Prediction journal: logs each analysis and self-evaluates over time.

Each /analyze/single call appends a prediction (direction + spot). When the next
snapshot arrives we resolve the previous open prediction against the new spot —
did price actually move the predicted way? This yields a rolling, real hit-rate
you can use to judge (and later recalibrate) the heuristic engine.

Storage is a JSON-lines file under backend/data/. Single-user, no concurrency.
"""

import json
import os
from datetime import datetime

_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
_PATH = os.path.join(_DIR, "journal.jsonl")

# Fallback flat-band when no expected_move was recorded (older entries, or a
# prediction made without a valid expected-range). Move smaller than this
# fraction of spot counts as FLAT / sideways.
_FLAT_THRESHOLD = 0.0025  # 0.25%

# When an expected_move (the ATM straddle-implied move at prediction time) is
# available, use it to size the flat-band instead — a move within ~30% of
# what the model itself expected shouldn't be graded UP/DOWN just because it
# crosses an arbitrary fixed percentage.
_FLAT_FRACTION_OF_EXPECTED_MOVE = 0.30


def _ensure():
    os.makedirs(_DIR, exist_ok=True)
    if not os.path.exists(_PATH):
        open(_PATH, "a").close()


def _read_all() -> list:
    _ensure()
    out = []
    with open(_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return out


def _write_all(entries: list):
    _ensure()
    with open(_PATH, "w", encoding="utf-8") as f:
        for e in entries:
            f.write(json.dumps(e) + "\n")


def _evaluate(direction: str, old_spot: float, new_spot: float, expected_move: float | None = None) -> tuple:
    """Return (outcome, actual_dir, move)."""
    move = new_spot - old_spot
    if expected_move:
        thr = _FLAT_FRACTION_OF_EXPECTED_MOVE * expected_move
    else:
        thr = _FLAT_THRESHOLD * old_spot if old_spot else 0.0
    if move > thr:
        actual = "UP"
    elif move < -thr:
        actual = "DOWN"
    else:
        actual = "FLAT"
    correct = (
        (direction == "BULLISH" and actual == "UP")
        or (direction == "BEARISH" and actual == "DOWN")
        or (direction == "SIDEWAYS" and actual == "FLAT")
    )
    return ("CORRECT" if correct else "WRONG"), actual, round(move, 1)


def record_prediction(
    spot: float,
    direction: str,
    weighted_score: float,
    expiry: str,
    expected_move: float | None = None,
    confidence: str | None = None,
) -> None:
    """Resolve the previous open prediction against `spot`, then log a new one."""
    try:
        entries = _read_all()
        # Resolve the most recent still-open entry using this new spot — but only
        # if it's a comparable snapshot (same expiry), so an unrelated upload
        # doesn't pollute the hit-rate. Different expiry => leave it open.
        for e in reversed(entries):
            if e.get("resolved"):
                continue
            prev_exp = e.get("expiry", "") or ""
            this_exp = expiry or ""
            if prev_exp and this_exp and prev_exp != this_exp:
                break  # different contract — don't grade across expiries
            outcome, actual, move = _evaluate(
                e.get("direction", "SIDEWAYS"), e.get("spot", spot), spot,
                e.get("expected_move"),
            )
            e["resolved"] = True
            e["outcome"] = outcome
            e["actual_dir"] = actual
            e["actual_move"] = move
            e["resolved_ts"] = datetime.now().isoformat(timespec="seconds")
            e["resolved_spot"] = spot
            break

        entries.append({
            "id": datetime.now().isoformat(timespec="seconds"),
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "spot": round(float(spot), 2),
            "direction": direction,
            "weighted_score": weighted_score,
            "confidence": confidence,
            "expected_move": round(float(expected_move), 2) if expected_move else None,
            "expiry": expiry or "",
            "resolved": False,
            "outcome": None,
        })
        # Keep the file bounded.
        _write_all(entries[-500:])
    except Exception:
        # Journalling must never break an analysis.
        pass


def get_stats() -> dict:
    """Aggregate hit-rate and return recent entries (newest first)."""
    try:
        entries = _read_all()
    except Exception:
        entries = []

    resolved = [e for e in entries if e.get("resolved")]
    correct = [e for e in resolved if e.get("outcome") == "CORRECT"]
    hit_rate = round(len(correct) / len(resolved) * 100, 1) if resolved else None

    def _rate_for(sub):
        c = [e for e in sub if e.get("outcome") == "CORRECT"]
        return {
            "total": len(sub),
            "correct": len(c),
            "rate": round(len(c) / len(sub) * 100, 1) if sub else None,
        }

    def _dir_rate(d):
        return _rate_for([e for e in resolved if e.get("direction") == d])

    def _confidence_rate(level):
        return _rate_for([e for e in resolved if e.get("confidence") == level])

    return {
        "total_predictions": len(entries),
        "resolved": len(resolved),
        "correct": len(correct),
        "hit_rate": hit_rate,
        "open": len(entries) - len(resolved),
        "by_direction": {
            "BULLISH": _dir_rate("BULLISH"),
            "BEARISH": _dir_rate("BEARISH"),
            "SIDEWAYS": _dir_rate("SIDEWAYS"),
        },
        # Are HIGH-confidence calls actually right more often than LOW-confidence
        # ones? Entries recorded before `confidence` was tracked have it as
        # None and simply won't appear in any of these three buckets.
        "by_confidence": {
            "HIGH": _confidence_rate("HIGH"),
            "MODERATE": _confidence_rate("MODERATE"),
            "LOW": _confidence_rate("LOW"),
        },
        "recent": list(reversed(entries[-20:])),
    }


def reset_journal() -> None:
    _ensure()
    open(_PATH, "w").close()
