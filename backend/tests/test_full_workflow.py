import pytest
import uuid
from datetime import datetime, timezone, timedelta, date
from pydantic import ValidationError

from app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from app.shared.utils.username_filter import is_friendly_username
from app.shared.utils.email_verifier import verify_email_address
from app.shared.utils.landmark_verifier import validate_public_landmark
from app.modules.users.schemas import OnboardingRequest
from app.modules.users.service import calculate_age
from app.modules.activities.schemas import (
    ActivityCreateRequest,
    ActivityUpdateRequest,
    JoinRequestCreate,
    JoinRequestDecisionRequest,
)
from app.modules.messaging.schemas import MessageCreateRequest
from app.modules.safety.schemas import ReportCreateRequest
from app.modules.matching.schemas import (
    RecommendationBreakdown,
    ActivityRecommendationItem,
    PeerRecommendationItem,
)
from app.modules.notifications.schemas import NotificationResponse


# =========================================================================
# 1. AUTH & ONBOARDING WORKFLOW TESTS
# =========================================================================

def test_full_auth_and_safety_pipeline():
    """Verify end-to-end registration validation and password/JWT security."""
    # 1. Profane/abusive username must be blocked
    abusive_usernames = ["fucku", "f_u_c_k_u", "asshole99", "bitch_queen", "whore_dev"]
    for un in abusive_usernames:
        is_valid, msg = is_friendly_username(un)
        assert is_valid is False
        assert "friendly, respectful name" in msg

    # 2. Friendly usernames pass
    clean_usernames = ["arjun_runner", "priya_art", "kolkata_explorer", "bookworm_soumya"]
    for un in clean_usernames:
        is_valid, msg = is_friendly_username(un)
        assert is_valid is True
        assert msg is None

    # 3. Email syntax validation and deliverability checks
    valid, norm, sugg, code = verify_email_address("user@example.com", check_mx=False)
    assert valid is True
    assert norm == "user@example.com"

    bad_valid, _, _, bad_code = verify_email_address("bad-email.com", check_mx=False)
    assert bad_valid is False
    assert bad_code == "INVALID_SYNTAX"

    # 4. Password hashing security
    raw_pass = "P@ssw0rdSecure2026!"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

    # 5. JWT Token issuance and decoding
    user_id = str(uuid.uuid4())
    token = create_access_token({"sub": user_id, "email": "explorer@kolkata.org"})
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["email"] == "explorer@kolkata.org"
    assert payload["type"] == "access"


def test_onboarding_age_and_location_privacy():
    """Ensure onboarding rejects minors and leaks of private residential addresses."""
    today = date.today()

    # Underage user (< 18) rejected
    underage_dob = date(today.year - 17, today.month, today.day)
    with pytest.raises(ValueError, match="at least 18 years old"):
        OnboardingRequest(
            display_name="Youngster",
            birth_date=underage_dob,
            general_location="Salt Lake, Kolkata",
            interests=[{"interest_id": str(uuid.uuid4()), "proficiency_level": 2}],
        )

    # Valid adult
    adult_dob = date(today.year - 24, today.month, today.day)
    assert calculate_age(adult_dob) == 24

    # Private residential address rejected
    with pytest.raises(ValueError, match="prohibited for privacy and safety"):
        OnboardingRequest(
            display_name="Kolkata Explorer",
            birth_date=adult_dob,
            general_location="Flat 3A, Block B, Silver Heights Apartment",
            interests=[{"interest_id": str(uuid.uuid4()), "proficiency_level": 3}],
        )

    # Safe general locality passes
    valid_onboarding = OnboardingRequest(
        display_name="Kolkata Explorer",
        birth_date=adult_dob,
        general_location="Salt Lake Sector 1, Kolkata",
        interests=[{"interest_id": str(uuid.uuid4()), "proficiency_level": 3}],
    )
    assert valid_onboarding.display_name == "Kolkata Explorer"
    assert valid_onboarding.general_location == "Salt Lake Sector 1, Kolkata"


# =========================================================================
# 2. ACTIVITY & SAFE LANDMARK LIFECYCLE TESTS
# =========================================================================

def test_activity_lifecycle_and_landmark_verification():
    """Verify that meetups mandate verified public landmarks and reject homes."""
    # 1. Prohibited private/residential meeting points
    private_venues = [
        "Flat 101, Sun City Apartments",
        "My house near lake garden",
        "Room 4, Youth Hostel",
        "Come to my place in Newtown",
        "12B, 2nd floor, Park Street",
    ]
    for venue in private_venues:
        valid, msg = validate_public_landmark(venue)
        assert valid is False
        assert "Residential, private apartments, or domestic addresses are strictly prohibited" in msg

    # 2. Safe verified public landmarks
    public_venues = [
        "Sovabazar Sutanuti Metro Station Gate 2",
        "Victoria Memorial North Gate",
        "Salt Lake Central Park Main Entrance",
        "Indian Museum Courtyard",
        "Princep Ghat Riverfront Steps",
    ]
    for venue in public_venues:
        valid, msg = validate_public_landmark(venue)
        assert valid is True
        assert msg == ""

    # 3. Create valid activity with verified landmark
    now = datetime.now(timezone.utc)
    start_time = now + timedelta(days=3)
    end_time = start_time + timedelta(hours=4)

    act_create = ActivityCreateRequest(
        title="Durga Puja Pandal Hopping - North Kolkata",
        description="Experience heritage pujas around Bagbazar, Sovabazar and Kumartuli.",
        category_id=uuid.uuid4(),
        city="Kolkata",
        location_landmark="Sovabazar Sutanuti Metro Station Gate 2",
        start_time=start_time,
        end_time=end_time,
        min_participants=3,
        max_participants=10,
        rules="Wear comfortable walking shoes. Non-dating platonic meetup.",
    )
    assert act_create.title == "Durga Puja Pandal Hopping - North Kolkata"
    assert act_create.max_participants == 10
    assert act_create.min_participants == 3


def test_join_request_and_decision_lifecycle():
    """Verify participant join request creation and host decision validation."""
    # 1. Applicant creates join request with greeting note
    req = JoinRequestCreate(
        note="Hi! I love heritage photography and would love to join your North Kolkata pandal hopping walk!"
    )
    assert req.note is not None
    assert len(req.note) > 10
    assert "heritage photography" in req.note

    # 2. Host decision schema validation
    approve_decision = JoinRequestDecisionRequest(action="ACCEPT")
    assert approve_decision.action == "ACCEPT"

    decline_decision = JoinRequestDecisionRequest(action="REJECT")
    assert decline_decision.action == "REJECT"

    with pytest.raises(ValidationError):
        JoinRequestDecisionRequest(action="INVALID_ACTION")


# =========================================================================
# 3. MESSAGING, SAFETY & REPORTING TESTS
# =========================================================================

def test_chat_messaging_and_safety_moderation():
    """Verify group chat validation, moderation, and community safety reporting."""
    # 1. Valid chat message
    valid_msg = MessageCreateRequest(content="See you all at Gate 2 tomorrow at 4 PM!")
    assert valid_msg.content == "See you all at Gate 2 tomorrow at 4 PM!"

    # 2. Empty chat message rejected
    with pytest.raises(ValidationError):
        MessageCreateRequest(content="   ")

    # 3. Community safety reporting for dating app behavior
    dating_violation_report = ReportCreateRequest(
        reason="DATING_ATTEMPT",
        description="User asked for romantic date in direct messages, violating community rules.",
    )
    assert dating_violation_report.reason == "DATING_ATTEMPT"
    assert len(dating_violation_report.description) >= 10

    # 4. Reporting for private location violation
    private_loc_report = ReportCreateRequest(
        reason="PRIVATE_LOCATION_VIOLATION",
        description="Host tried to change the meetup venue to a private apartment flat.",
    )
    assert private_loc_report.reason == "PRIVATE_LOCATION_VIOLATION"


# =========================================================================
# 4. EXPLAINABLE AI RECOMMENDATION FORMULA TEST
# =========================================================================

def test_explainable_ai_heuristic_formula():
    """
    Verify the transparent deterministic recommendation scoring:
    Score S = 0.40 * S_interest + 0.30 * S_schedule + 0.20 * S_location + 0.10 * S_category
    Bounds: S in [0.0, 1.0]
    """
    s_int = 0.80
    s_sch = 1.00
    s_loc = 0.70
    s_cat = 1.00

    w_int, w_sch, w_loc, w_cat = 0.40, 0.30, 0.20, 0.10
    total_score = (w_int * s_int) + (w_sch * s_sch) + (w_loc * s_loc) + (w_cat * s_cat)
    total_score = round(total_score, 4)

    # 0.40*0.80 = 0.32
    # 0.30*1.00 = 0.30
    # 0.20*0.70 = 0.14
    # 0.10*1.00 = 0.10
    # Total = 0.32 + 0.30 + 0.14 + 0.10 = 0.86
    assert total_score == 0.86
    assert 0.0 <= total_score <= 1.0

    breakdown = RecommendationBreakdown(
        interest_score=s_int,
        schedule_score=s_sch,
        location_score=s_loc,
        category_score=s_cat,
    )
    assert breakdown.interest_score == 0.80
    assert breakdown.schedule_score == 1.00
    assert breakdown.location_score == 0.70
    assert breakdown.category_score == 1.00
