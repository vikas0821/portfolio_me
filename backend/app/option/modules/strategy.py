"""Strategy suggester: maps probability + levels into a concrete trade."""

import pandas as pd

from app.option.config import LOT_SIZE, MAX_SPREAD_WIDTH
from app.option.modules.levels import (
    ltp_at,
    nearest_strike,
    nearest_resistance_above,
    nearest_support_below,
    next_strike_above,
    next_strike_below,
)

# Iron Condor short legs shouldn't sit further than this from ATM (deep-OTM OI
# walls — common crash-protection strikes — make terrible short strikes).
IC_SHORT_CAP = 2 * MAX_SPREAD_WIDTH


def _leg(action, opt_type, strike, premium):
    return {
        "action": action,
        "type": opt_type,
        "strike": float(strike),
        "premium": round(float(premium), 2),
        "lot_size": LOT_SIZE,
    }


def _no_trade(name, rationale, warning):
    return {
        "strategy_name": name,
        "can_trade": False,
        "legs": [],
        "net_cost": 0.0,
        "net_credit": 0.0,
        "break_even": None,
        "max_profit": 0.0,
        "max_loss": 0.0,
        "profit_range": None,
        "rationale": rationale,
        "warning": warning,
    }


def suggest_strategy(prob: dict, levels: dict, atm: float, df: pd.DataFrame, dte: int) -> dict:
    """Return a strategy dict per the rule set."""
    try:
        bullish = prob.get("bullish_pct", 0)
        bearish = prob.get("bearish_pct", 0)
        sideways = prob.get("sideways_pct", 0)

        iv_summary = levels.get("iv_summary", {})
        iv_rank = iv_summary.get("iv_rank", 0)

        # ── DTE <= 3: theta regime ───────────────────────────────────────
        if dte <= 3:
            if iv_rank > 60:
                return _build_iron_condor(
                    df, atm, dte,
                    rationale="Expiry near with elevated IV — premium selling via "
                              "Iron Condor benefits from theta and IV crush.",
                    warning="High gamma risk near expiry; keep position size small.",
                )
            return _no_trade(
                "NO TRADE",
                "Less than 3 days to expiry — theta decay rapidly kills option buyers.",
                "Theta kills buyers. Avoid directional debit trades this close to expiry.",
            )

        # ── Strong bullish ───────────────────────────────────────────────
        if bullish > 60 and dte > 3:
            buy_strike = atm
            sell_strike = nearest_resistance_above(df, atm)
            if sell_strike <= buy_strike:
                sell_strike = float(df[df["strike"] > atm]["strike"].min())
            # Cap the width so the short leg isn't an impractically far wall.
            if sell_strike - buy_strike > MAX_SPREAD_WIDTH:
                sell_strike = nearest_strike(df, buy_strike + MAX_SPREAD_WIDTH)
            buy_prem = ltp_at(df, buy_strike, "c")
            sell_prem = ltp_at(df, sell_strike, "c")
            net_cost = (buy_prem - sell_prem) * LOT_SIZE
            width = sell_strike - buy_strike
            max_profit = (width - (buy_prem - sell_prem)) * LOT_SIZE
            max_loss = max(net_cost, 0)
            be = buy_strike + (buy_prem - sell_prem)
            return {
                "strategy_name": "Bull Call Spread",
                "can_trade": True,
                "legs": [
                    _leg("BUY", "CALL", buy_strike, buy_prem),
                    _leg("SELL", "CALL", sell_strike, sell_prem),
                ],
                "net_cost": round(net_cost, 2),
                "net_credit": 0.0,
                "break_even": round(be, 2),
                "max_profit": round(max_profit, 2),
                "max_loss": round(max_loss, 2),
                "profit_range": [round(be, 2), float(sell_strike)],
                "rationale": f"Bullish bias ({bullish:.0f}%). Buy ATM {buy_strike:.0f} CE, "
                             f"sell resistance {sell_strike:.0f} CE to cap cost.",
                "warning": None,
            }

        # ── Strong bearish ───────────────────────────────────────────────
        if bearish > 60 and dte > 3:
            buy_strike = atm
            sell_strike = nearest_support_below(df, atm)
            if sell_strike >= buy_strike:
                sell_strike = float(df[df["strike"] < atm]["strike"].max())
            # Cap the width so the short leg isn't an impractically far wall.
            if buy_strike - sell_strike > MAX_SPREAD_WIDTH:
                sell_strike = nearest_strike(df, buy_strike - MAX_SPREAD_WIDTH)
            buy_prem = ltp_at(df, buy_strike, "p")
            sell_prem = ltp_at(df, sell_strike, "p")
            net_cost = (buy_prem - sell_prem) * LOT_SIZE
            width = buy_strike - sell_strike
            max_profit = (width - (buy_prem - sell_prem)) * LOT_SIZE
            max_loss = max(net_cost, 0)
            be = buy_strike - (buy_prem - sell_prem)
            return {
                "strategy_name": "Bear Put Spread",
                "can_trade": True,
                "legs": [
                    _leg("BUY", "PUT", buy_strike, buy_prem),
                    _leg("SELL", "PUT", sell_strike, sell_prem),
                ],
                "net_cost": round(net_cost, 2),
                "net_credit": 0.0,
                "break_even": round(be, 2),
                "max_profit": round(max_profit, 2),
                "max_loss": round(max_loss, 2),
                "profit_range": [float(sell_strike), round(be, 2)],
                "rationale": f"Bearish bias ({bearish:.0f}%). Buy ATM {buy_strike:.0f} PE, "
                             f"sell support {sell_strike:.0f} PE to cap cost.",
                "warning": None,
            }

        # ── Sideways ─────────────────────────────────────────────────────
        if sideways > 50 and dte > 3:
            return _build_iron_condor(
                df, atm, dte,
                rationale=f"Range-bound bias ({sideways:.0f}%). Iron Condor collects "
                          "premium while price stays between the walls.",
                warning=None,
            )

        # ── Unclear ──────────────────────────────────────────────────────
        if (40 < bullish < 60) or (40 < bearish < 60):
            return _no_trade(
                "WAIT",
                "No clear directional edge. Monitor OI shifts for ~30 minutes before "
                "committing capital.",
                "Signal strength insufficient — avoid forcing a trade.",
            )

        return _no_trade(
            "WAIT",
            "Conditions do not match a defined setup. Stay flat.",
            None,
        )
    except Exception as exc:  # never crash the analysis
        return _no_trade("UNAVAILABLE", f"Strategy engine error: {exc}", str(exc))


def _build_iron_condor(df, atm, dte, rationale, warning):
    sell_call = nearest_resistance_above(df, atm)
    sell_put = nearest_support_below(df, atm)
    # Keep the short strikes near ATM (ignore far deep-OTM walls).
    if sell_call - atm > IC_SHORT_CAP:
        sell_call = nearest_strike(df, atm + IC_SHORT_CAP)
    if atm - sell_put > IC_SHORT_CAP:
        sell_put = nearest_strike(df, atm - IC_SHORT_CAP)

    # Snap protective wings to real strikes ~300 pts out; never let a wing land
    # on (or inside) its short strike.
    buy_call = nearest_strike(df, sell_call + 300)
    if buy_call <= sell_call:
        buy_call = next_strike_above(df, sell_call)
    buy_put = nearest_strike(df, sell_put - 300)
    if buy_put >= sell_put:
        buy_put = next_strike_below(df, sell_put)

    sc_prem = ltp_at(df, sell_call, "c")
    bc_prem = ltp_at(df, buy_call, "c")
    sp_prem = ltp_at(df, sell_put, "p")
    bp_prem = ltp_at(df, buy_put, "p")

    net_credit = (sc_prem - bc_prem + sp_prem - bp_prem) * LOT_SIZE
    # Max loss = widest wing minus the credit (computed from actual strikes).
    width = max(abs(buy_call - sell_call), abs(sell_put - buy_put), 1)
    max_loss = (width * LOT_SIZE) - net_credit
    be_upper = sell_call + (net_credit / LOT_SIZE)
    be_lower = sell_put - (net_credit / LOT_SIZE)
    return {
        "strategy_name": "Iron Condor",
        "can_trade": True,
        "legs": [
            _leg("SELL", "CALL", sell_call, sc_prem),
            _leg("BUY", "CALL", buy_call, bc_prem),
            _leg("SELL", "PUT", sell_put, sp_prem),
            _leg("BUY", "PUT", buy_put, bp_prem),
        ],
        "net_cost": 0.0,
        "net_credit": round(net_credit, 2),
        "break_even": [round(be_lower, 2), round(be_upper, 2)],
        "max_profit": round(net_credit, 2),
        "max_loss": round(max_loss, 2),
        "profit_range": [round(be_lower, 2), round(be_upper, 2)],
        "rationale": rationale,
        "warning": warning,
    }
