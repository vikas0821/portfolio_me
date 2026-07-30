"""Signal-alignment / conviction meter.

Instead of trusting one blended percentage, this checks how many *independent*
signals agree. Broad agreement = high conviction; a split = low conviction even
if the weighted score looks decisive.
"""


def compute_alignment(parameter_scores: list) -> dict:
    # Note: GEX is already one of `parameter_scores` (added by
    # `_score_gex` inside `compute_probability`, under name "Gamma (GEX)")
    # — it must not be appended again here, or its vote gets double-counted
    # toward bullish_count/bearish_count/agreement_pct.
    signals = []
    for p in parameter_scores or []:
        signals.append({"name": p["name"], "signal": p.get("signal", "NEUTRAL")})

    bull = sum(1 for s in signals if s["signal"] == "BULLISH")
    bear = sum(1 for s in signals if s["signal"] == "BEARISH")
    neutral = sum(1 for s in signals if s["signal"] == "NEUTRAL")
    directional = bull + bear

    if bull > bear:
        aligned = "BULLISH"
    elif bear > bull:
        aligned = "BEARISH"
    else:
        aligned = "NEUTRAL"

    agreement = (max(bull, bear) / directional * 100) if directional else 0.0

    # Conviction blends agreement strength with how many signals actually point.
    if agreement >= 75 and directional >= 4:
        conviction = "HIGH"
    elif agreement >= 60 and directional >= 3:
        conviction = "MODERATE"
    else:
        conviction = "LOW"

    # A meaningful conflict = both sides have real representation.
    conflict = bull >= 2 and bear >= 2

    note = (
        f"{max(bull, bear)} of {directional} directional signals point "
        f"{aligned}."
        if directional
        else "No directional signals."
    )
    if conflict:
        note += " Signals are split — treat the bias with caution."

    return {
        "signals": signals,
        "bullish_count": bull,
        "bearish_count": bear,
        "neutral_count": neutral,
        "aligned_direction": aligned,
        "agreement_pct": round(agreement, 1),
        "conviction": conviction,
        "conflict": conflict,
        "note": note,
    }
