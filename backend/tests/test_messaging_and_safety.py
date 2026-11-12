import pytest
import uuid
from pydantic import ValidationError

from app.modules.safety.schemas import ReportCreateRequest
from app.modules.messaging.schemas import MessageCreateRequest
from app.modules.matching.schemas import RecommendationBreakdown, ActivityRecommendationItem
from app.modules.notifications.schemas import NotificationResponse


def test_safety_report_validation():
    # Valid report
    rep = ReportCreateRequest(
        reason="DATING_ATTEMPT",
        description="User sent romantic DM inquiries despite community non-dating guidelines.",
    )
    assert rep.reason == "DATING_ATTEMPT"

    # Invalid reason
    with pytest.raises(ValidationError):
        ReportCreateRequest(
            reason="INVALID_REASON",
            description="Some description that is long enough.",
        )

    # Description too short (< 10 chars)
    with pytest.raises(ValidationError):
        ReportCreateRequest(
            reason="HARASSMENT",
            description="Too short",
        )


def test_chat_message_validation():
    # Valid message
    msg = MessageCreateRequest(content="Hey everyone! Looking forward to meeting at Metro Gate 1.")
    assert "Metro Gate 1" in msg.content

    # Empty content
    with pytest.raises(ValidationError):
        MessageCreateRequest(content="")


def test_recommendation_schemas():
    breakdown = RecommendationBreakdown(
        interest_score=0.85,
        schedule_score=0.90,
        location_score=1.0,
        category_score=0.75,
    )
    assert breakdown.interest_score == 0.85
    assert breakdown.location_score == 1.0

