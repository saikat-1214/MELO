import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.modules.users.models import User
from app.modules.safety.schemas import BlockResponse, ReportCreateRequest, ReportResponse
from app.modules.safety.service import SafetyService

router = APIRouter(prefix="/safety", tags=["Safety & Moderation"])


@router.post("/block/{user_id}", response_model=BlockResponse, status_code=status.HTTP_201_CREATED)
async def block_user(
    user_id: uuid.UUID,
    reason: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Block a user bidirectionally. Blocked users will not see each other's activities or send requests.
    """
    return await SafetyService.block_user(db, blocker=current_user, blocked_id=user_id, reason=reason)


@router.delete("/block/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unblock_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Unblock a previously blocked user.
    """
    await SafetyService.unblock_user(db, blocker=current_user, blocked_id=user_id)


@router.get("/blocks", response_model=List[BlockResponse])
async def list_blocks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all users blocked by the current user.
    """
    return await SafetyService.list_blocks(db, user_id=current_user.id)


@router.post("/report", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_safety_report(
    payload: ReportCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a confidential safety or moderation report against a user or an activity.
    """
    return await SafetyService.create_report(db, reporter=current_user, payload=payload)

