import uuid
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


class BlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    blocker_id: uuid.UUID
    blocked_id: uuid.UUID
    reason: Optional[str] = None
    created_at: datetime


class ReportCreateRequest(BaseModel):
    reported_user_id: Optional[uuid.UUID] = None
    activity_id: Optional[uuid.UUID] = None
    reason: Literal[
        "DATING_ATTEMPT",
        "INAPPROPRIATE_BEHAVIOR",
        "HARASSMENT",
        "PRIVATE_LOCATION_VIOLATION",
        "SPAM",
        "OTHER",
    ] = Field(..., description="Categorized violation type")
    description: str = Field(..., min_length=10, max_length=1500, description="Detailed explanation of the safety incident")


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reporter_id: uuid.UUID
    reported_user_id: Optional[uuid.UUID] = None
    activity_id: Optional[uuid.UUID] = None
    reason: str
    description: str
    status: str
    created_at: datetime

