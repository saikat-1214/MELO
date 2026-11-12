import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.modules.activities.schemas import ActivitySummaryResponse


class RecommendationBreakdown(BaseModel):
    interest_score: float
    schedule_score: float
    location_score: float
    category_score: float


class ActivityRecommendationItem(BaseModel):
    activity: ActivitySummaryResponse
    match_score: float
    match_percentage: int
    breakdown: RecommendationBreakdown
    explanations: List[str]


class ActivityRecommendationsResponse(BaseModel):
    algorithm_version: str
    items: List[ActivityRecommendationItem]


class PeerRecommendationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    display_name: str
    avatar_url: Optional[str] = None
    general_location: str
    age: Optional[int] = None
    bio: Optional[str] = None
    shared_interests: List[str] = []
    match_score: float
    match_percentage: int
    breakdown: RecommendationBreakdown
    explanations: List[str]


class PeerRecommendationsResponse(BaseModel):
    algorithm_version: str
    items: List[PeerRecommendationItem]

