"""Regression test for the GEX double-counting bug in the alignment meter."""

import pytest

from app.option.modules.alignment import compute_alignment


def test_gex_counted_exactly_once():
    # parameter_scores already contains a "Gamma (GEX)" entry (as produced by
    # _score_gex inside compute_probability) — compute_alignment must not
    # append a second one. One BULLISH (PCR), one BEARISH (Max Pain), and one
    # BULLISH (GEX) => bullish_count must be exactly 2, not 3 (which is what
    # the old double-append bug would have produced).
    parameter_scores = [
        {"name": "PCR (OI)", "signal": "BULLISH"},
        {"name": "Max Pain Distance", "signal": "BEARISH"},
        {"name": "Gamma (GEX)", "signal": "BULLISH"},
    ]
    result = compute_alignment(parameter_scores)
    total_counted = result["bullish_count"] + result["bearish_count"] + result["neutral_count"]
    assert total_counted == len(parameter_scores)
    assert len(result["signals"]) == len(parameter_scores)
    assert result["bullish_count"] == 2
    assert result["bearish_count"] == 1


def test_compute_alignment_no_longer_accepts_a_second_argument():
    # Regression guard: the old signature accepted a second `gex_signal` arg
    # (the source of the double-count). Calling that way must now fail
    # loudly (TypeError) rather than silently double-counting again.
    with pytest.raises(TypeError):
        compute_alignment([{"name": "PCR (OI)", "signal": "NEUTRAL"}], {"signal": "BULLISH"})
