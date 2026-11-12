import logging
import sys
from app.core.config import settings


def setup_ai_logging():
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    log_format = "%(asctime)s [%(levelname)s] [ai-service] [%(name)s]: %(message)s"

    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    logger = logging.getLogger("socialconnect.ai")
    logger.info(f"AI Service logging configured at {logging.getLevelName(log_level)} level.")
    return logger

