import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("socialconnect.matching_client")


class AIServiceClient:
    @staticmethod
    def _base_url() -> str:
        base = settings.AI_SERVICE_URL.rstrip("/")
        if not base.endswith("/api/v1"):
            base = f"{base}/api/v1"
        return base

    @staticmethod
    async def match_activities(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Sends sanitized candidates to the independent AI ranking microservice.
        """
        try:
            async with httpx.AsyncClient(timeout=settings.AI_SERVICE_TIMEOUT_SECONDS) as client:
                res = await client.post(f"{AIServiceClient._base_url()}/match/activities", json=payload)
                if res.status_code == 200:
                    return res.json()
                logger.warning(f"AI service returned non-200 status: {res.status_code} {res.text}")
                return None
        except Exception as e:
            logger.warning(f"AI service unreachable ({e}). Activating internal fallback scorer.")
            return None

    @staticmethod
    async def match_users(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Sends candidate users to the independent AI ranking microservice.
        """
        try:
            async with httpx.AsyncClient(timeout=settings.AI_SERVICE_TIMEOUT_SECONDS) as client:
                res = await client.post(f"{AIServiceClient._base_url()}/match/users", json=payload)
                if res.status_code == 200:
                    return res.json()
                logger.warning(f"AI service returned non-200 status: {res.status_code}")
                return None
        except Exception as e:
            logger.warning(f"AI service unreachable ({e}). Activating internal fallback scorer.")
            return None

