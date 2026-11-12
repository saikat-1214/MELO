from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import setup_ai_logging
from app.api.endpoints import api_router

logger = setup_ai_logging()

app = FastAPI(
    title="SocialConnect AI Recommendation Engine",
    description="Independent recommendation and matching microservice using explainable scoring.",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/api/v1/openapi.json",
)

app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "SocialConnect AI Recommendation Engine",
        "version": "0.1.0",
        "algorithm_version": settings.ALGORITHM_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health",
    }

