import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select, func, desc, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notification
from app.modules.notifications.schemas import NotificationResponse, NotificationListResponse
from app.shared.exceptions.base import NotFoundException


class NotificationService:
    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: uuid.UUID,
        title: str,
        content: str,
        notification_type: str,
        link_url: Optional[str] = None,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            content=content,
            notification_type=notification_type,
            link_url=link_url,
            is_read=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(notif)
        await db.commit()
        await db.refresh(notif)
        return notif

    @staticmethod
    async def list_notifications(
        db: AsyncSession,
        user_id: uuid.UUID,
        limit: int = 30,
    ) -> NotificationListResponse:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(desc(Notification.created_at))
            .limit(limit)
        )
        res = await db.execute(stmt)
        items = res.scalars().all()

        count_stmt = (
            select(func.count(Notification.id))
            .where(Notification.user_id == user_id, Notification.is_read == False)
        )
        count_res = await db.execute(count_stmt)
        unread_count = count_res.scalar() or 0

        return NotificationListResponse(
            items=[NotificationResponse.model_validate(n) for n in items],
            unread_count=unread_count,
        )

    @staticmethod
    async def get_unread_count(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> int:
        stmt = (
            select(func.count(Notification.id))
            .where(Notification.user_id == user_id, Notification.is_read == False)
        )
        res = await db.execute(stmt)
        return res.scalar() or 0

    @staticmethod
    async def mark_as_read(
        db: AsyncSession,
        notification_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> NotificationResponse:
        stmt = select(Notification).where(
            Notification.id == notification_id, Notification.user_id == user_id
        )
        res = await db.execute(stmt)
        notif = res.scalar_one_or_none()
        if not notif:
            raise NotFoundException("Notification not found.")

        notif.is_read = True
        await db.commit()
        await db.refresh(notif)
        return NotificationResponse.model_validate(notif)

    @staticmethod
    async def mark_all_as_read(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount

