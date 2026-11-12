import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str
    notification_type: str
    link_url: Optional[str] = None
    is_read: bool
    created_at: datetime


class UnreadCountResponse(BaseModel):
    unread_count: int


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    unread_count: int

