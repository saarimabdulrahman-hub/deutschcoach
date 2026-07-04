import pytest
from datetime import datetime, timedelta
from app.srs.engine import calculate_srs
from app.models.srs import SRSState, CardStatus


def make_card(**overrides):
    """Factory for a default SRSState object (not saved to DB)."""
    defaults = dict(
        id=1,
        user_id=1,
        vocab_entry_id=1,
        easiness_factor=2.5,
        interval_days=0,
        repetitions=0,
        lapses=0,
        next_review_at=datetime.utcnow(),
        last_reviewed_at=None,
        status=CardStatus.new,
    )
    defaults.update(overrides)
    card = SRSState(**defaults)
    return card


def test_perfect_recall_on_new_card():
    card = make_card()
    result = calculate_srs(card, 5)
    assert result.repetitions == 1
    assert result.interval_days == 1
    assert result.easiness_factor == 2.6  # +0.1 for rating 5
    assert result.status == CardStatus.learning  # 1 rep => learning
    assert result.next_review_at > datetime.utcnow()


def test_second_perfect_recall():
    card = make_card(repetitions=1, interval_days=1, status=CardStatus.learning)
    result = calculate_srs(card, 5)
    assert result.repetitions == 2
    assert result.interval_days == 6  # second rep -> 6 days
    assert result.status == CardStatus.reviewing


def test_lapse_resets_progress():
    card = make_card(
        repetitions=3, interval_days=15, easiness_factor=2.5,
        status=CardStatus.reviewing
    )
    result = calculate_srs(card, 2)  # rating < 3 = lapse
    assert result.repetitions == 0
    assert result.lapses == 1
    assert result.interval_days == 1
    assert result.easiness_factor == pytest.approx(2.18)  # 2.5 - 0.32 = 2.18
    assert result.status == CardStatus.learning


def test_mastery_after_five_reps():
    card = make_card(repetitions=4, interval_days=30, status=CardStatus.reviewing)
    result = calculate_srs(card, 4)  # rating 4 is pass
    assert result.repetitions == 5
    assert result.status == CardStatus.mastered


def test_ease_never_below_1_3():
    card = make_card(easiness_factor=1.3, repetitions=3, interval_days=10)
    result = calculate_srs(card, 2)  # lapse
    assert result.easiness_factor == 1.3  # clamped at minimum


def test_rating_4_does_not_change_ease():
    card = make_card(easiness_factor=2.5)
    result = calculate_srs(card, 4)
    assert result.easiness_factor == 2.5  # +0.0


def test_rating_3_decreases_ease():
    card = make_card(easiness_factor=2.5)
    result = calculate_srs(card, 3)
    assert result.easiness_factor == pytest.approx(2.36)  # -0.14
