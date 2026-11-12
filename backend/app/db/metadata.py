from app.db.base import Base
from app.modules.users.models import User, UserProfile, UserAvailability
from app.modules.interests.models import ActivityCategory, Interest, UserInterest
from app.modules.activities.models import Activity, ActivityParticipant, JoinRequest
from app.modules.messaging.models import Conversation, ConversationMember, Message
from app.modules.notifications.models import Notification
from app.modules.safety.models import UserBlock, Report

# Registry for Alembic autogeneration and table registration
target_metadata = Base.metadata

__all__ = [
    "Base",
    "target_metadata",
    "User",
    "UserProfile",
    "UserAvailability",
    "ActivityCategory",
    "Interest",
    "UserInterest",
    "Activity",
    "ActivityParticipant",
    "JoinRequest",
    "Conversation",
    "ConversationMember",
    "Message",
    "Notification",
    "UserBlock",
    "Report",
]
