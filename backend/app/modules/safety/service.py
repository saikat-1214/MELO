import uuid
from datetime import datetime, timezone
from typing import Set, List
from sqlalchemy import select, or_, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User
from app.modules.safety.models import UserBlock, Report
from app.modules.safety.schemas import BlockResponse, ReportCreateRequest, ReportResponse
from app.shared.exceptions.base import (
    NotFoundException,
    BadRequestException,
    ConflictException,
)


class SafetyService:
    @staticmethod
    async def block_user(
        db: AsyncSession,
        blocker: User,
        blocked_id: uuid.UUID,
        reason: str = None,
    ) -> BlockResponse:
        if blocker.id == blocked_id:
            raise BadRequestException("You cannot block yourself.")

        # Check target exists
        target_stmt = select(User).where(User.id == blocked_id)
        target_res = await db.execute(target_stmt)
        if not target_res.scalar_one_or_none():
            raise NotFoundException("User to block does not exist.")

        # Check existing block
        existing_stmt = select(UserBlock).where(
            UserBlock.blocker_id == blocker.id, UserBlock.blocked_id == blocked_id
        )
        existing_res = await db.execute(existing_stmt)
        if existing_res.scalar_one_or_none():
            raise ConflictException("User is already blocked.")

        block = UserBlock(
            blocker_id=blocker.id,
            blocked_id=blocked_id,
            reason=reason,
            created_at=datetime.now(timezone.utc),
        )
        db.add(block)
        await db.commit()
        await db.refresh(block)
        return BlockResponse.model_validate(block)

    @staticmethod
    async def unblock_user(
        db: AsyncSession,
        blocker: User,
        blocked_id: uuid.UUID,
    ) -> None:
        stmt = delete(UserBlock).where(
            UserBlock.blocker_id == blocker.id, UserBlock.blocked_id == blocked_id
        )
        res = await db.execute(stmt)
        if res.rowcount == 0:
            raise NotFoundException("Block record not found.")
        await db.commit()

    @staticmethod
    async def list_blocks(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[BlockResponse]:
        stmt = select(UserBlock).where(UserBlock.blocker_id == user_id)
        res = await db.execute(stmt)
        blocks = res.scalars().all()
        return [BlockResponse.model_validate(b) for b in blocks]

    @staticmethod
    async def get_bidirectional_blocked_user_ids(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> Set[uuid.UUID]:
        """
        Returns set of user IDs who have either blocked this user
        OR have been blocked by this user.
        """
        stmt = select(UserBlock).where(
            or_(UserBlock.blocker_id == user_id, UserBlock.blocked_id == user_id)
        )
        res = await db.execute(stmt)
        blocks = res.scalars().all()

        blocked_set: Set[uuid.UUID] = set()
        for b in blocks:
            if b.blocker_id == user_id:
                blocked_set.add(b.blocked_id)
            else:
                blocked_set.add(b.blocker_id)
        return blocked_set

    @staticmethod
    async def create_report(
        db: AsyncSession,
        reporter: User,
        payload: ReportCreateRequest,
    ) -> ReportResponse:
        report = Report(
            reporter_id=reporter.id,
            reported_user_id=payload.reported_user_id,
            activity_id=payload.activity_id,
            reason=payload.reason,
            description=payload.description.strip(),
            status="PENDING",
            created_at=datetime.now(timezone.utc),
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)
        return ReportResponse.model_validate(report)

