from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException, status
from app.core.config import settings
from app.modules.ranking.scorer import scorer
from app.shared.schemas import ActivityMatchRequest, UserMatchRequest, RankingResponse

api_router = APIRouter(prefix="/api/v1")


def verify_internal_auth(x_internal_key: str = Header(None)):
    """Validates that callers have provided the backend internal service key if in production."""
    if settings.ENVIRONMENT == "production":
        if not x_internal_key or x_internal_key != settings.BACKEND_INTERNAL_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized internal service call",
            )


@api_router.get("/health", tags=["Health"])
async def ai_health_check():
    """Health check endpoint for the independent AI microservice."""
    return {
        "status": "healthy",
        "service": "socialconnect-ai-service",
        "version": "0.1.0",
        "algorithm_version": settings.ALGORITHM_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "weights": {
            "interest": settings.WEIGHT_INTEREST,
            "schedule": settings.WEIGHT_SCHEDULE,
            "location": settings.WEIGHT_LOCATION,
            "category": settings.WEIGHT_CATEGORY,
        },
    }


@api_router.post(
    "/match/activities",
    response_model=RankingResponse,
    tags=["Activity Recommendation"],
)
async def match_activities(request: ActivityMatchRequest):
    """
    Ranks candidate activities against a user profile vector using deterministic heuristics.
    Returns explainable scoring factors and human-readable reasons.
    """
    return scorer.rank_activities(
        user=request.user,
        candidates=request.candidates,
        limit=request.limit or 20,
    )


@api_router.post(
    "/match/users",
    response_model=RankingResponse,
    tags=["Peer Recommendation"],
)
async def match_peers(request: UserMatchRequest):
    """
    Ranks candidate peers for prospective group formation and shared interest exploration.
    """
    return scorer.rank_peers(
        user=request.user,
        candidates=request.candidates,
        limit=request.limit or 20,
    )

