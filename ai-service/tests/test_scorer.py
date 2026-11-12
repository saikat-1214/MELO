import pytest
from app.modules.ranking.scorer import HeuristicScorer
from app.shared.schemas import (
    UserVector,
    CandidateActivity,
    CandidateUser,
    AvailabilitySlot,
)


@pytest.fixture
def scorer():
    return HeuristicScorer()


def test_interest_overlap_exact_match(scorer):
    score, shared = scorer.compute_interest_overlap(
        ["hiking", "photography", "board games"],
        ["photography", "hiking", "board games"],
    )
    assert score == 1.0
    assert len(shared) == 3


def test_interest_overlap_disjoint(scorer):
    score, shared = scorer.compute_interest_overlap(
        ["rock climbing", "pottery"],
        ["football", "swimming"],
    )
    assert score == 0.0
    assert len(shared) == 0


def test_interest_overlap_partial(scorer):
    score, shared = scorer.compute_interest_overlap(
        ["hiking", "photography"],
        ["photography", "camping"],
    )
    # intersection: 1, union: 3 -> 1/3 = 0.3333
    assert abs(score - 0.3333) < 0.01
    assert shared == ["photography"]


def test_interest_overlap_empty_inputs(scorer):
    score, shared = scorer.compute_interest_overlap([], ["music"])
    assert score == 0.0
    assert shared == []


def test_schedule_alignment_exact_match(scorer):
    avail = [AvailabilitySlot(day_of_week=5, time_slot="EVENING")]
    score, explanation = scorer.compute_schedule_alignment(avail, 5, "EVENING")
    assert score == 1.0
    assert "Exact match" in explanation


def test_schedule_alignment_all_day_match(scorer):
    avail = [AvailabilitySlot(day_of_week=6, time_slot="ALL_DAY")]
    score, explanation = scorer.compute_schedule_alignment(avail, 6, "MORNING")
    assert score == 0.8
    assert "Matches full-day" in explanation


def test_schedule_alignment_same_day_different_slot(scorer):
    avail = [AvailabilitySlot(day_of_week=0, time_slot="MORNING")]
    score, explanation = scorer.compute_schedule_alignment(avail, 0, "NIGHT")
    assert score == 0.25
    assert "different time slot" in explanation


def test_schedule_alignment_no_constraints(scorer):
    score, explanation = scorer.compute_schedule_alignment([], 2, "AFTERNOON")
    assert score == 0.2
    assert "No specific availability" in explanation


def test_location_compatibility(scorer):
    # Same locality
    score1, exp1 = scorer.compute_location_compatibility("Salt Lake, Kolkata", "Salt Lake Sector V, Kolkata")
    assert score1 >= 0.7
    assert "Salt Lake" in exp1 or "Kolkata" in exp1

    # Completely different
    score2, _ = scorer.compute_location_compatibility("Mumbai", "Bangalore")
    assert score2 <= 0.1


def test_rank_activities(scorer):
    user = UserVector(
        user_id="u1",
        interests=["photography", "heritage walks", "street food"],
        category_preferences=["Festivals & Culture", "Photography"],
        general_location="North Kolkata",
        availability=[AvailabilitySlot(day_of_week=5, time_slot="EVENING")],
    )

    cands = [
        CandidateActivity(
            activity_id="act-match",
            category="Festivals & Culture",
            category_slug="festivals-culture",
            interests=["photography", "heritage walks"],
            general_location="Kumartuli, North Kolkata",
            day_of_week=5,
            time_slot="EVENING",
            capacity=10,
            available_spots=4,
        ),
        CandidateActivity(
            activity_id="act-mismatch",
            category="Sports & Fitness",
            category_slug="sports-fitness",
            interests=["football"],
            general_location="South Mumbai",
            day_of_week=1,
            time_slot="MORNING",
            capacity=12,
            available_spots=2,
        ),
    ]

    response = scorer.rank_activities(user, cands)
    assert response.total_candidates == 2
    assert len(response.ranked_results) == 2

    top = response.ranked_results[0]
    assert top.entity_id == "act-match"
    assert top.score > 0.75
    assert top.breakdown.interest_score > 0.0
    assert top.breakdown.schedule_score == 1.0
    assert len(top.explanations) > 0


def test_rank_peers(scorer):
    user = UserVector(
        user_id="u1",
        interests=["board games", "coffee"],
        category_preferences=[],
        general_location="Park Street, Kolkata",
        availability=[AvailabilitySlot(day_of_week=6, time_slot="AFTERNOON")],
    )

    peer1 = CandidateUser(
        user_id="p1",
        interests=["board games", "coffee", "chess"],
        general_location="Park Street, Kolkata",
        availability=[AvailabilitySlot(day_of_week=6, time_slot="AFTERNOON")],
    )

    peer2 = CandidateUser(
        user_id="p2",
        interests=["cricket"],
        general_location="Salt Lake, Kolkata",
        availability=[AvailabilitySlot(day_of_week=2, time_slot="MORNING")],
    )

    response = scorer.rank_peers(user, [peer1, peer2])
    assert response.total_candidates == 2
    assert response.ranked_results[0].entity_id == "p1"
    assert response.ranked_results[0].score > response.ranked_results[1].score
