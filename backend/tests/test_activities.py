import pytest
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import ValidationError

from app.shared.utils.landmark_verifier import validate_public_landmark
from app.modules.activities.schemas import (
    ActivityCreateRequest,
    ActivityUpdateRequest,
    JoinRequestCreate,
    JoinRequestDecisionRequest,
)


def test_public_landmark_verifier():
    # Valid public landmarks
    valid_landmarks = [
        "Park Street Metro Station Gate 1",
        "Salt Lake Stadium Main Entrance",
        "South City Mall CCD Café",
        "Victoria Memorial North Gate",
        "National Library Reading Hall Entrance",
        "Central Park Boating Counter",
    ]
    for lm in valid_landmarks:
        valid, msg = validate_public_landmark(lm)
        assert valid is True, f"Expected '{lm}' to be valid, got error: {msg}"
        assert msg == ""

    # Prohibited residential / private addresses
    invalid_landmarks = [
        "Flat 3B, Tower 4, Silver Heights",
        "My apartment near ruby hospital",
        "Room 12, Sunrise Hostel",
        "Come to my room",
        "My house near bus stop",
        "14A, Block C, 3rd floor",
        "My flat in new town",
        "My place near bazaar",
        "House no 42, lane 5",
        "Short",  # under 5 chars
    ]
    for lm in invalid_landmarks:
        valid, msg = validate_public_landmark(lm)
        assert valid is False, f"Expected '{lm}' to be rejected as private/residential"
        assert len(msg) > 0


def test_activity_create_validation_success():
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=2)
    end = start + timedelta(hours=3)

    req = ActivityCreateRequest(
        title="Durga Puja Pandal Hopping - North Kolkata",
        description="Exploring historic Durga Puja pandals across Bagbazar, Sovabazar, and Kumartuli.",
        category_id=uuid.uuid4(),
        city="Kolkata",
        location_landmark="Sovabazar Sutanuti Metro Station Gate 2",
        start_time=start,
        end_time=end,
        min_participants=2,
        max_participants=8,
        rules="Wear comfortable footwear and carry water.",
    )

    assert req.title == "Durga Puja Pandal Hopping - North Kolkata"
    assert req.city == "Kolkata"
    assert req.min_participants == 2
    assert req.max_participants == 8


def test_activity_create_rejects_residential_landmark():
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    end = start + timedelta(hours=2)

    with pytest.raises(ValidationError) as exc:
        ActivityCreateRequest(
            title="Board Games Evening",
            description="Playing Catan and Ticket to Ride together.",
            category_id=uuid.uuid4(),
            city="Kolkata",
            location_landmark="Flat 2A, Green Valley Apartment",
            start_time=start,
            end_time=end,
            min_participants=2,
            max_participants=6,
        )
    assert "Residential, private apartments, or domestic addresses are strictly prohibited" in str(exc.value)


def test_activity_create_rejects_past_time():
    now = datetime.now(timezone.utc)
    past_start = now - timedelta(hours=2)
    end = now + timedelta(hours=1)

    with pytest.raises(ValidationError) as exc:
        ActivityCreateRequest(
            title="Morning Jog at Central Park",
            description="Jogging around the lake followed by fresh coconut water.",
            category_id=uuid.uuid4(),
            city="Kolkata",
            location_landmark="Central Park Gate 3 Entrance",
            start_time=past_start,
            end_time=end,
            min_participants=2,
            max_participants=5,
        )
    assert "start time must be in the future" in str(exc.value)


def test_activity_create_rejects_end_before_start():
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    invalid_end = start - timedelta(minutes=30)

    with pytest.raises(ValidationError) as exc:
        ActivityCreateRequest(
            title="Football Weekend Friendly",
            description="Casual 5-a-side football on artificial turf.",
            category_id=uuid.uuid4(),
            city="Kolkata",
            location_landmark="Salt Lake Sports Complex Turf",
            start_time=start,
            end_time=invalid_end,
            min_participants=4,
            max_participants=10,
        )
    assert "end time must be after the start time" in str(exc.value)


def test_activity_create_rejects_invalid_capacity():
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    end = start + timedelta(hours=2)

    # Max less than min
    with pytest.raises(ValidationError) as exc:
        ActivityCreateRequest(
            title="Photography Walk",
            description="Street photography around colonial monuments in Dalhousie square.",
            category_id=uuid.uuid4(),
            city="Kolkata",
            location_landmark="General Post Office Front Steps",
            start_time=start,
            end_time=end,
            min_participants=6,
            max_participants=3,
        )
    assert "Maximum participants cannot be less than minimum participants" in str(exc.value)


def test_join_request_decision_schema():
    accept_decision = JoinRequestDecisionRequest(action="ACCEPT")
    assert accept_decision.action == "ACCEPT"

    reject_decision = JoinRequestDecisionRequest(action="REJECT")
    assert reject_decision.action == "REJECT"

    with pytest.raises(ValidationError):
        JoinRequestDecisionRequest(action="MAYBE")  # invalid action

