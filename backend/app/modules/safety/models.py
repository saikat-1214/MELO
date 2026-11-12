import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    String, Text, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.users.models import User
    from app.modules.activities.models import Activity


class UserBlock(Base):
    __tablename__ = "user_blocks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    blocker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    blocked_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("blocker_id", "blocked_id", name="uq_user_block"),
    )

    blocker: Mapped["User"] = relationship("User", foreign_keys=[blocker_id])
    blocked: Mapped["User"] = relationship("User", foreign_keys=[blocked_id])


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    reporter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reported_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    activity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    reason: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # DATING_ATTEMPT, INAPPROPRIATE_BEHAVIOR, HARASSMENT, PRIVATE_LOCATION_VIOLATION, SPAM, OTHER
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING", nullable=False, index=True
    )  # PENDING, REVIEWED, DISMISSED, ACTION_TAKEN
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    reporter: Mapped["User"] = relationship("User", foreign_keys=[reporter_id])
    reported_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reported_user_id])
    activity: Mapped[Optional["Activity"]] = relationship("Activity", foreign_keys=[activity_id])

