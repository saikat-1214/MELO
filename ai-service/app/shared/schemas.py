from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AvailabilitySlot(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6, description="0=Sunday, 6=Saturday")
    time_slot: str = Field(..., description="MORNING, AFTERNOON, EVENING, NIGHT, ALL_DAY")


class UserVector(BaseModel):
    user_id: str
    interests: List[str] = Field(default_factory=list)
    interest_proficiencies: Dict[str, int] = Field(default_factory=dict)
    general_location: str = ""
    availability: List[AvailabilitySlot] = Field(default_factory=list)
    category_preferences: List[str] = Field(default_factory=list)


class CandidateActivity(BaseModel):
    activity_id: str
    category: str
    category_slug: str
    interests: List[str] = Field(default_factory=list)
    general_location: str
    day_of_week: int = Field(..., ge=0, le=6)
    time_slot: str
    capacity: int
    available_spots: int


class ActivityMatchRequest(BaseModel):
    user: UserVector
    candidates: List[CandidateActivity]
    limit: Optional[int] = 20


class CandidateUser(BaseModel):
    user_id: str
    interests: List[str] = Field(default_factory=list)
    general_location: str = ""
    availability: List[AvailabilitySlot] = Field(default_factory=list)


class UserMatchRequest(BaseModel):
    user: UserVector
    candidates: List[CandidateUser]
    limit: Optional[int] = 20


class ScoreBreakdown(BaseModel):
    interest_score: float
    schedule_score: float
    location_score: float
    category_score: float


class ScoredEntity(BaseModel):
    entity_id: str
    score: float
    breakdown: ScoreBreakdown
    explanations: List[str]


class RankingResponse(BaseModel):
    algorithm_version: str
    total_candidates: int
    ranked_results: List[ScoredEntity]

