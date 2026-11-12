from typing import List, Union
import json
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AISettings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8001
    HOST: str = "0.0.0.0"

    BACKEND_INTERNAL_API_KEY: str = "dev_internal_ai_service_key_32chars_min"
    ALLOWED_HOSTS: Union[List[str], str] = ["127.0.0.1", "localhost"]

    ALGORITHM_VERSION: str = "v1.0-heuristic"
    WEIGHT_INTEREST: float = 0.40
    WEIGHT_SCHEDULE: float = 0.30
    WEIGHT_LOCATION: float = 0.20
    WEIGHT_CATEGORY: float = 0.10
    MIN_THRESHOLD_EXPLANATION: float = 0.45

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = AISettings()

