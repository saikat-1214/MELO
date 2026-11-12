from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.modules.interests.schemas import CategoryResponse, InterestResponse
from app.modules.interests.service import interest_service

router = APIRouter(tags=["Interests & Categories"])


@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Retrieves active activity categories."""
    return await interest_service.get_categories(db)


@router.get("/interests", response_model=List[InterestResponse])
async def list_interests(
    category: Optional[str] = Query(None, description="Optional category filter"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves standardized interests taxonomy with optional category filter."""
    return await interest_service.get_interests(db, category=category)
