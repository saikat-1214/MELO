import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


from app.shared.utils.username_filter import is_friendly_username


class AvailabilitySlotSchema(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6, description="0=Sunday, 6=Saturday")
    time_slot: str = Field(..., description="MORNING, AFTERNOON, EVENING, NIGHT, ALL_DAY")


class UserInterestInput(BaseModel):
    interest_id: uuid.UUID
    proficiency_level: int = Field(1, ge=1, le=5)


class InterestDetailSchema(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    category: str
    icon_name: str
    proficiency_level: int


class OnboardingRequest(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    birth_date: date
    gender: Optional[str] = None
    general_location: str = Field(..., min_length=2, max_length=150, description="City or general district, e.g. 'Salt Lake, Kolkata'")
    languages: List[str] = Field(default_factory=list)
    interests: List[UserInterestInput] = Field(default_factory=list, min_length=1, description="Select at least one interest")
    availability: List[AvailabilitySlotSchema] = Field(default_factory=list)

    @field_validator("display_name")
    @classmethod
    def validate_friendly_name(cls, v: str) -> str:
        is_friendly, reason = is_friendly_username(v)
        if not is_friendly:
            raise ValueError(reason)
        return v.strip()

    @field_validator("birth_date")
    @classmethod
    def validate_age_eligibility(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("You must be at least 18 years old to join SocialConnect.")
        if age > 120:
            raise ValueError("Invalid birth date.")
        return v

    @field_validator("general_location")
    @classmethod
    def validate_general_location_privacy(cls, v: str) -> str:
        # Prevent residential address leakage
        sensitive_keywords = ["flat", "apartment", "apt", "house", "road no", "street no", "lane", "door no", "room"]
        v_lower = v.lower()
        for kw in sensitive_keywords:
            if kw in v_lower:
                raise ValueError(
                    f"Please enter only your general city or district name (e.g. 'North Kolkata', 'Salt Lake'). "
                    f"Residential details ('{kw}') are prohibited for privacy and safety."
                )
        return v.strip()


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    general_location: Optional[str] = Field(None, min_length=2, max_length=150)
    languages: Optional[List[str]] = None
    visibility_scope: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator("display_name")
    @classmethod
    def validate_friendly_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            is_friendly, reason = is_friendly_username(v)
            if not is_friendly:
                raise ValueError(reason)
            return v.strip()
        return v


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email: str
    display_name: str
    bio: Optional[str]
    birth_date: date
    age: int
    gender: Optional[str]
    general_location: str
    languages: List[str]
    visibility_scope: str
    avatar_url: Optional[str]
    interests: List[InterestDetailSchema]
    availability: List[AvailabilitySlotSchema]
    created_at: datetime
    updated_at: datetime


class PublicUserProfileResponse(BaseModel):
    user_id: uuid.UUID
    display_name: str
    bio: Optional[str]
    age: int
    gender: Optional[str]
    general_location: str
    languages: List[str]
    avatar_url: Optional[str]
    interests: List[InterestDetailSchema]
