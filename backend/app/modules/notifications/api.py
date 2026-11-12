import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.modules.users.models import User
from app.modules.notifications.schemas import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse,
)
from app.modules.notifications.service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get notifications for the logged-in user.
    """
    return await NotificationService.list_notifications(db, user_id=current_user.id, limit=limit)


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get unread notification count for badge display.
    """
    count = await NotificationService.get_unread_count(db, user_id=current_user.id)
    return UnreadCountResponse(unread_count=count)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a notification as read.
    """
    return await NotificationService.mark_as_read(db, notification_id=notification_id, user_id=current_user.id)


@router.put("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark all unread notifications as read.
    """
    count = await NotificationService.mark_all_as_read(db, user_id=current_user.id)
    return {"updated": count, "message": "All notifications marked as read."}

