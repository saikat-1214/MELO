from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.modules.users.models import User
from app.modules.matching.schemas import (
    ActivityRecommendationsResponse,
    PeerRecommendationsResponse,
)
from app.modules.matching.service import MatchingService

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations & Matching"])


@router.get("/activities", response_model=ActivityRecommendationsResponse)
async def get_recommended_activities(
    limit: int = Query(12, ge=1, le=50, description="Max recommendations to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get AI-ranked activity recommendations explainable with mathematical factor breakdowns:
    - 40% Interest Overlap
    - 30% Schedule Compatibility
    - 20% Locality Proximity
    - 10% Category Affinity
    """
    return await MatchingService.get_recommended_activities(db, user=current_user, limit=limit)


@router.get("/peers", response_model=PeerRecommendationsResponse)
async def get_recommended_peers(
    limit: int = Query(10, ge=1, le=50, description="Max peer companions to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get AI-ranked compatible companions based on shared interests and mutual availability.
    Strictly platonic friendship matching.
    """
    return await MatchingService.get_recommended_peers(db, user=current_user, limit=limit)

