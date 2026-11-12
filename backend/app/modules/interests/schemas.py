import uuid
from typing import Optional
from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    icon: str
    is_active: bool


class InterestResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    category: str
    description: Optional[str] = None
    icon_name: str
    is_system_defined: bool
