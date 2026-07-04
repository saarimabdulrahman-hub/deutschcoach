from datetime import datetime, timedelta
from app.models.srs import SRSState, CardStatus


def next_interval(repetitions: int, easiness_factor: float, previous_interval: int) -> int:
    """Determine the next interval in days based on SM-2 recursive formula I(n) = I(n-1) * EF."""
    if repetitions == 1:
        return 1
    elif repetitions == 2:
        return 6
    else:
        return max(1, round(previous_interval * easiness_factor))


def adjust_ease(easiness_factor: float, rating: int) -> float:
    """Adjust easiness factor based on recall quality using standard SM-2 values."""
    adjustments = {5: 0.1, 4: 0.0, 3: -0.14, 2: -0.32, 1: -0.54, 0: -0.80}
    delta = adjustments.get(rating, -0.80)
    return max(1.3, easiness_factor + delta)


def calculate_srs(card: SRSState, rating: int) -> SRSState:
    """Pure function: apply SM-2 algorithm to a card given a 0-5 rating.

    Returns the mutated card (caller is responsible for persisting).
    """
    now = datetime.utcnow()
    card.last_reviewed_at = now
    previous_interval = card.interval_days

    if rating >= 3:
        card.repetitions += 1
        card.interval_days = next_interval(card.repetitions, card.easiness_factor, previous_interval)
        card.easiness_factor = adjust_ease(card.easiness_factor, rating)

        if card.repetitions >= 5:
            card.status = CardStatus.mastered
        elif card.repetitions >= 2:
            card.status = CardStatus.reviewing
        elif card.repetitions >= 1:
            card.status = CardStatus.learning
    else:
        card.repetitions = 0
        card.lapses += 1
        card.interval_days = 1
        card.easiness_factor = adjust_ease(card.easiness_factor, rating)
        card.status = CardStatus.learning

    card.next_review_at = now + timedelta(days=card.interval_days)
    return card
