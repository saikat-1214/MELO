import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user
from app.modules.users.models import User
from app.modules.users.schemas import (
    OnboardingRequest,
    UserProfileUpdate,
    UserProfileResponse,
    PublicUserProfileResponse,
)
from app.modules.users.service import profile_service

router = APIRouter(prefix="/profiles", tags=["User Profiles & Onboarding"])


@router.post("/onboarding", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def complete_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits onboarding setup including age eligibility (18+),
    general location (privacy-preserving), selected interests, and availability.
    """
    return await profile_service.complete_onboarding(db, current_user, req)


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves the full profile of the authenticated user."""
    return await profile_service.get_profile_by_user_id(db, current_user.id, current_user.email)


@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    req: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates editable profile information for the authenticated user."""
    return await profile_service.update_profile(db, current_user, req)


@router.get("/{user_id}", response_model=PublicUserProfileResponse)
async def get_public_profile(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves the public profile for another user.
    Redacts sensitive details (email, exact birth date) and preserves privacy.
    """
    return await profile_service.get_public_profile(db, user_id)
