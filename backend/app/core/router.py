from datetime import datetime, timezone
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import check_database_connection
from app.modules.authentication.api import router as auth_router
from app.modules.users.api import router as profiles_router
from app.modules.interests.api import router as interests_router
from app.modules.activities.api import router as activities_router
from app.modules.notifications.api import router as notifications_router
from app.modules.messaging.api import router as messaging_router
from app.modules.safety.api import router as safety_router
from app.modules.matching.api import router as matching_router

api_router = APIRouter(prefix="/api/v1")


@api_router.get("/health", tags=["Health"])
async def health_check():
    """General health check endpoint reporting service and database status."""
    db_status = await check_database_connection()
    is_healthy = db_status["connected"]

    payload = {
        "status": "healthy" if is_healthy else "degraded",
        "service": "socialconnect-backend",
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status,
    }

    status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(status_code=status_code, content=payload)


@api_router.get("/health/db", tags=["Health"])
async def db_health_check():
    """Specific deep database connectivity verification."""
    db_status = await check_database_connection()
    status_code = status.HTTP_200_OK if db_status["connected"] else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(status_code=status_code, content=db_status)


# Mount feature module routers
api_router.include_router(auth_router)
api_router.include_router(profiles_router)
api_router.include_router(interests_router)
api_router.include_router(activities_router)
api_router.include_router(notifications_router)
api_router.include_router(messaging_router)
api_router.include_router(safety_router)
api_router.include_router(matching_router)
