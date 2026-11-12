from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.router import api_router
from app.db.session import check_database_connection
from app.shared.exceptions.handlers import register_exception_handlers

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown routines."""
    logger.info("Initializing SocialConnect Core Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT} | Debug: {settings.DEBUG}")

    # Check database connectivity during startup
    db_status = await check_database_connection()
    if db_status["connected"]:
        logger.info(f"PostgreSQL connection verified successfully ({db_status['latency_ms']}ms).")
    else:
        logger.warning(
            f"PostgreSQL connection check failed during startup: {db_status['message']}. "
            "Backend will start in degraded mode until database is reachable."
        )

    yield

    logger.info("Shutting down SocialConnect Core Backend...")


app = FastAPI(
    title="SocialConnect Core Backend API",
    description=(
        "Interest-based friendship and real-world meetup platform backend. "
        "Strictly activity-first, community-driven, non-dating platform."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register central error and exception handlers
register_exception_handlers(app)

# Register API v1 routes
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "SocialConnect Core Backend API",
        "version": "0.1.0",
        "docs": "/docs",
        "api_v1": "/api/v1",
        "health": "/api/v1/health",
    }
