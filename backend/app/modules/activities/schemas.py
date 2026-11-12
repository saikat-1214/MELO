import uuid
from datetime import datetime, timezone
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict, model_validator, field_validator
from app.shared.utils.landmark_verifier import validate_public_landmark


class CategorySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    icon: str


class HostSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    display_name: str
    avatar_url: Optional[str] = None
    general_location: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None


class ParticipantSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    display_name: str
    avatar_url: Optional[str] = None
    general_location: Optional[str] = None
    role: str
    joined_at: datetime


class ActivityCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=150, description="Clear, public activity title")
    description: str = Field(..., min_length=15, max_length=2000, description="Detailed explanation of the activity")
    category_id: uuid.UUID = Field(..., description="UUID of the selected activity category")
    city: str = Field(..., min_length=2, max_length=100, description="City or district (e.g. Kolkata, Bengaluru)")
    location_landmark: str = Field(..., min_length=5, max_length=255, description="Public meeting point (e.g. Metro Gate 1, Stadium entrance)")
    approx_latitude: Optional[float] = None
    approx_longitude: Optional[float] = None
    start_time: datetime = Field(..., description="Activity starting date and time")
    end_time: datetime = Field(..., description="Activity ending date and time")
    min_participants: int = Field(default=2, ge=2, le=100)
    max_participants: int = Field(default=10, ge=2, le=100)
    rules: Optional[str] = Field(default=None, max_length=1000, description="Expectations or guidelines for participants")

    @field_validator("location_landmark")
    @classmethod
    def check_landmark(cls, v: str) -> str:
        valid, msg = validate_public_landmark(v)
        if not valid:
            raise ValueError(msg)
        return v.strip()

    @model_validator(mode="after")
    def validate_times_and_capacity(self) -> "ActivityCreateRequest":
        now = datetime.now(timezone.utc)
        # Ensure start_time has timezone awareness for comparison
        st = self.start_time if self.start_time.tzinfo else self.start_time.replace(tzinfo=timezone.utc)
        et = self.end_time if self.end_time.tzinfo else self.end_time.replace(tzinfo=timezone.utc)

        if st < now:
            raise ValueError("Activity start time must be in the future.")
        if et <= st:
            raise ValueError("Activity end time must be after the start time.")
        if self.max_participants < self.min_participants:
            raise ValueError("Maximum participants cannot be less than minimum participants.")
        return self


class ActivityUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=5, max_length=150)
    description: Optional[str] = Field(default=None, min_length=15, max_length=2000)
    city: Optional[str] = Field(default=None, min_length=2, max_length=100)
    location_landmark: Optional[str] = Field(default=None, min_length=5, max_length=255)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    min_participants: Optional[int] = Field(default=None, ge=2, le=100)
    max_participants: Optional[int] = Field(default=None, ge=2, le=100)
    rules: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("location_landmark")
    @classmethod
    def check_landmark(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid, msg = validate_public_landmark(v)
            if not valid:
                raise ValueError(msg)
            return v.strip()
        return v


class ActivitySummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    city: str
    location_landmark: str
    approx_latitude: Optional[float] = None
    approx_longitude: Optional[float] = None
    start_time: datetime
    end_time: datetime
    min_participants: int
    max_participants: int
    status: str
    rules: Optional[str] = None
    created_at: datetime
    category: CategorySummary
    host: HostSummary
    participant_count: int
    spots_left: int
    viewer_status: str = "NONE"  # "HOST", "MEMBER", "PENDING_REQUEST", "NONE"


class ActivityDetailResponse(ActivitySummaryResponse):
    participants: List[ParticipantSummary] = []


class ActivityListResponse(BaseModel):
    items: List[ActivitySummaryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class JoinRequestCreate(BaseModel):
    note: Optional[str] = Field(default=None, max_length=500, description="Short greeting or note to the activity host")


class RequesterSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    display_name: str
    avatar_url: Optional[str] = None
    general_location: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    interests: List[str] = []


class JoinRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    activity_id: uuid.UUID
    activity_title: Optional[str] = None
    requester: RequesterSummary
    note: Optional[str] = None
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None


class JoinRequestDecisionRequest(BaseModel):
    action: Literal["ACCEPT", "REJECT"] = Field(..., description="Action to take: ACCEPT or REJECT")


class MyActivitiesOverviewResponse(BaseModel):
    hosting: List[ActivitySummaryResponse]
    joined: List[ActivitySummaryResponse]
    pending_requests: List[JoinRequestResponse]
