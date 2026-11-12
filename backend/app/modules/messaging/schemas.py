import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator


class MessageCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="Chat message body")

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Message content cannot be empty or only whitespace")
        return v.strip()


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: Optional[uuid.UUID] = None
    sender_name: Optional[str] = "System"
    sender_avatar: Optional[str] = None
    content: str
    message_type: str  # USER, SYSTEM
    created_at: datetime


class ConversationMemberSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    display_name: str
    avatar_url: Optional[str] = None
    role: str


class ConversationSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    activity_id: Optional[uuid.UUID] = None
    title: str
    conversation_type: str
    member_count: int
    last_message: Optional[MessageResponse] = None
    created_at: datetime


class ConversationDetailResponse(ConversationSummaryResponse):
    members: List[ConversationMemberSummary] = []

