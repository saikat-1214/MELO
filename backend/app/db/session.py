import logging
from typing import AsyncGenerator, Dict, Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings

logger = logging.getLogger("socialconnect.database")

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an asynchronous database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database_connection() -> Dict[str, Any]:
    """
    Executes a lightweight query (SELECT 1) to verify database connectivity.
    Returns status dictionary with connection status and latency.
    """
    import time
    start_time = time.perf_counter()
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            if val == 1:
                return {
                    "connected": True,
                    "latency_ms": latency_ms,
                    "message": "PostgreSQL connection healthy",
                }
            return {
                "connected": False,
                "latency_ms": latency_ms,
                "message": f"Unexpected ping response: {val}",
            }
    except Exception as exc:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.warning(f"Database connectivity check failed ({latency_ms}ms): {exc}")
        return {
            "connected": False,
            "latency_ms": latency_ms,
            "message": str(exc),
        }
