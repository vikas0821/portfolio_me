"""Regression tests for expected-move-aware journal grading (D1) and the
confidence-bucketed stats breakdown (D2). Journal storage is redirected to a
temp file so these tests never touch the real backend/data/journal.jsonl.
"""

import pytest

from app.option.modules import journal


@pytest.fixture(autouse=True)
def isolated_journal(tmp_path, monkeypatch):
    monkeypatch.setattr(journal, "_PATH", str(tmp_path / "journal.jsonl"))
    yield


class TestExpectedMoveGrading:
    def test_move_within_expected_band_is_flat_even_if_over_old_fixed_threshold(self):
        # old_spot=25000, expected_move=300 -> 30% of that = 90 pts flat band.
        # A 70-point move (0.28% of spot) would have exceeded the OLD fixed
        # 0.25%-of-spot threshold (62.5 pts) and been graded UP, but must now
        # be graded FLAT since it's well inside the model's own expected move.
        outcome, actual, move = journal._evaluate(
            "SIDEWAYS", old_spot=25000.0, new_spot=25070.0, expected_move=300.0,
        )
        assert actual == "FLAT"
        assert outcome == "CORRECT"

    def test_move_beyond_expected_band_is_graded_directionally(self):
        outcome, actual, move = journal._evaluate(
            "BULLISH", old_spot=25000.0, new_spot=25150.0, expected_move=300.0,
        )
        assert actual == "UP"
        assert outcome == "CORRECT"

    def test_falls_back_to_fixed_threshold_when_no_expected_move_stored(self):
        # Old journal entries recorded before this change have no
        # expected_move — must still grade using the old constant.
        outcome, actual, move = journal._evaluate(
            "SIDEWAYS", old_spot=25000.0, new_spot=25010.0, expected_move=None,
        )
        assert actual == "FLAT"  # 10pts / 25000 = 0.04% < 0.25%


class TestConfidenceBucketedStats:
    def test_by_confidence_breakdown_present_and_accurate(self):
        journal.record_prediction(25000.0, "BULLISH", 70.0, "2025-01-01", expected_move=200.0, confidence="HIGH")
        journal.record_prediction(25300.0, "BULLISH", 70.0, "2025-01-01", expected_move=200.0, confidence="HIGH")
        # ^ second call resolves the first (25000 -> 25300 is a real UP move, BULLISH correct)

        stats = journal.get_stats()
        assert "by_confidence" in stats
        assert stats["by_confidence"]["HIGH"]["total"] == 1
        assert stats["by_confidence"]["HIGH"]["correct"] == 1
        assert stats["by_confidence"]["HIGH"]["rate"] == 100.0
        # No LOW/MODERATE predictions were recorded.
        assert stats["by_confidence"]["LOW"]["total"] == 0
        assert stats["by_confidence"]["LOW"]["rate"] is None
