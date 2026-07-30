"""Regression tests for the probability scoring engine bug fixes."""

import pandas as pd

from app.option.core.probability import (
    _percentages,
    _score_call_writing,
    _score_put_writing,
    compute_probability,
)
from app.option.config import PROBABILITY_WEIGHTS


def _empty_zone_df():
    # A single strike far outside any ATM zone, so every zone filter used by
    # the writing-intensity scorers returns an empty (zero fresh-writing) slice.
    return pd.DataFrame({
        "strike": [99999.0],
        "c_oi": [0.0], "c_chng_oi": [0.0], "c_chng": [0.0],
        "p_oi": [0.0], "p_chng_oi": [0.0], "p_chng": [0.0],
    })


class TestPercentages:
    def test_neutral_score_is_even_three_way_split(self):
        bull, bear, side = _percentages(0.0)
        assert bull == bear == side
        assert abs(bull - 33.333) < 0.01

    def test_extreme_positive_score_is_dominantly_bullish(self):
        bull, bear, side = _percentages(100.0)
        assert bull > 80
        assert bear < 10
        assert side > 0  # never collapses fully to zero

    def test_extreme_negative_score_is_dominantly_bearish(self):
        bull, bear, side = _percentages(-100.0)
        assert bear > 80
        assert bull < 10
        assert side > 0

    def test_symmetric_around_zero(self):
        bull_pos, bear_pos, side_pos = _percentages(40.0)
        bull_neg, bear_neg, side_neg = _percentages(-40.0)
        assert abs(bull_pos - bear_neg) < 1e-9
        assert abs(bear_pos - bull_neg) < 1e-9
        assert abs(side_pos - side_neg) < 1e-9

    def test_monotonic_no_discontinuity_across_old_boundary(self):
        # The old formula had a hard-coded step at |score| == 15; the new
        # softmax must be smooth (strictly increasing) straight through it.
        scores = [0, 5, 10, 14, 15, 16, 20, 30]
        bulls = [_percentages(s)[0] for s in scores]
        assert bulls == sorted(bulls)


class TestWritingIntensityBaseline:
    def test_call_writing_zero_when_no_fresh_writing(self):
        result = _score_call_writing(_empty_zone_df(), atm=25000.0, total_oi=1_000_000.0)
        assert result["score"] == 0.0

    def test_put_writing_zero_when_no_fresh_writing(self):
        result = _score_put_writing(_empty_zone_df(), atm=25000.0, total_oi=1_000_000.0)
        assert result["score"] == 0.0


def _neutral_data():
    # Every scorer that runs here lands on exactly 0: PCR=1.0 (neutral band),
    # max pain distance=0, FLAT IV skew, PCR-vol=1.0, and an even
    # resistance/support ratio. No `gex_sig` is supplied, so GEX is skipped
    # entirely (excluded from the weight pool, not scored as 0) rather than
    # forced neutral.
    #
    # The one dummy strike row is placed far outside the ATM+/-300 zone (as
    # in _empty_zone_df above) so oi-pattern / writing-intensity see an empty
    # zone and score exactly 0 too. A row placed *at* ATM with all-zero
    # change/price fields would NOT be neutral here: get_oi_pattern's
    # zero-change boundary buckets a flat 0 as "down" (a pre-existing
    # asymmetry outside this fix's scope), which get_oi_pattern would then
    # read as LONG UNWIND on both legs — not what "neutral" should mean.
    df = pd.DataFrame({
        "strike": [99999.0], "c_oi": [0.0], "c_chng_oi": [0.0], "c_chng": [0.0],
        "c_vol": [0.0], "c_iv": [0.0], "c_ltp": [0.0],
        "p_oi": [0.0], "p_chng_oi": [0.0], "p_chng": [0.0],
        "p_vol": [0.0], "p_iv": [0.0], "p_ltp": [0.0],
    })
    return {
        "df": df, "atm": 25000.0, "spot": 25000.0, "max_pain": 25000.0,
        "pcr": {"oi": 1.0, "vol": 1.0}, "iv": {"skew_type": "FLAT", "skew_degree": 0.0},
        "dte": 10, "top_call_oi": 1.0, "top_put_oi": 1.0,
    }


class TestDteWeightExclusion:
    def test_dte_weight_does_not_dilute_other_parameters(self):
        result = compute_probability(_neutral_data())
        dte_param = next(p for p in result["parameter_scores"] if p["key"] == "dte_effect")
        assert dte_param["score"] == 0.0
        assert dte_param["contribution"] == 0.0


class TestNeutralDirection:
    def test_all_neutral_inputs_report_sideways_end_to_end(self):
        # Regression test for the confirmed bug: a perfectly neutral
        # weighted_score used to report BULLISH direction (50/30/20 baseline)
        # instead of an even three-way split resolving to SIDEWAYS.
        result = compute_probability(_neutral_data())
        assert result["weighted_score"] == 0.0
        assert result["direction"] == "SIDEWAYS"
        assert abs(result["bullish_pct"] - result["bearish_pct"]) < 0.01
        assert abs(result["bullish_pct"] - result["sideways_pct"]) < 0.01
