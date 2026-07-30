"""Regression tests for the strategy engine's DTE-gap fix."""

import pandas as pd

from app.option.modules.strategy import suggest_strategy


def _chain(atm=25000.0):
    strikes = [atm + i * 100 for i in range(-5, 6)]
    return pd.DataFrame({
        "strike": strikes,
        "c_oi": [1000.0] * len(strikes),
        "c_ltp": [max(1.0, atm + 200 - s) for s in strikes],
        "p_oi": [1000.0] * len(strikes),
        "p_ltp": [max(1.0, s - atm + 200) for s in strikes],
    })


def _bullish_prob(pct=85.0):
    return {"bullish_pct": pct, "bearish_pct": 100 - pct - 5, "sideways_pct": 5.0}


def _bearish_prob(pct=85.0):
    return {"bearish_pct": pct, "bullish_pct": 100 - pct - 5, "sideways_pct": 5.0}


def _sideways_prob(pct=65.0):
    remainder = (100 - pct) / 2
    return {"sideways_pct": pct, "bullish_pct": remainder, "bearish_pct": remainder}


class TestDteGapClosed:
    # Regression tests for the confirmed gap: dte=4 and dte=5 used to fall
    # through to WAIT regardless of conviction, because the directional
    # branches required dte > 5 while the no-trade branch only covered dte <= 3.

    def test_bull_call_spread_fires_at_dte_4(self):
        df = _chain()
        result = suggest_strategy(_bullish_prob(), {}, atm=25000.0, df=df, dte=4)
        assert result["strategy_name"] == "Bull Call Spread"
        assert result["can_trade"] is True

    def test_bull_call_spread_fires_at_dte_5(self):
        df = _chain()
        result = suggest_strategy(_bullish_prob(), {}, atm=25000.0, df=df, dte=5)
        assert result["strategy_name"] == "Bull Call Spread"
        assert result["can_trade"] is True

    def test_bear_put_spread_fires_at_dte_4(self):
        df = _chain()
        result = suggest_strategy(_bearish_prob(), {}, atm=25000.0, df=df, dte=4)
        assert result["strategy_name"] == "Bear Put Spread"
        assert result["can_trade"] is True

    def test_iron_condor_fires_at_dte_5_for_sideways(self):
        df = _chain()
        result = suggest_strategy(_sideways_prob(), {}, atm=25000.0, df=df, dte=5)
        assert result["strategy_name"] == "Iron Condor"
        assert result["can_trade"] is True

    def test_still_no_trade_at_dte_3_without_elevated_iv(self):
        # The dte <= 3 branch is untouched by this fix — still WAIT/NO TRADE
        # unless IV rank is elevated.
        df = _chain()
        result = suggest_strategy(
            _bullish_prob(), {"iv_summary": {"iv_rank": 10}}, atm=25000.0, df=df, dte=3,
        )
        assert result["strategy_name"] == "NO TRADE"
        assert result["can_trade"] is False
