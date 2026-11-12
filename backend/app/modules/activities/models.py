import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    String, Text, Boolean, Integer, Float, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, TimestampMixin


class Activity(Base, TimestampMixin):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    host_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activity_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    location_landmark: Mapped[str] = mapped_column(String(255), nullable=False)
    approx_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    approx_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    min_participants: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    max_participants: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="PUBLISHED", nullable=False, index=True
    )  # DRAFT, PUBLISHED, FULL, CANCELLED, COMPLETED
    rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("min_participants >= 2", name="check_min_participants_at_least_2"),
        CheckConstraint(
            "max_participants >= min_participants AND max_participants <= 100",
            name="check_max_participants_capacity_range",
        ),
    )

    # Relationships
    host: Mapped["User"] = relationship("User", foreign_keys=[host_id])
    category: Mapped["ActivityCategory"] = relationship("ActivityCategory")
    participants: Mapped[List["ActivityParticipant"]] = relationship(
        "ActivityParticipant", back_populates="activity", cascade="all, delete-orphan"
    )
    join_requests: Mapped[List["JoinRequest"]] = relationship(
        "JoinRequest", back_populates="activity", cascade="all, delete-orphan"
    )


class ActivityParticipant(Base):
    __tablename__ = "activity_participants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(30), default="MEMBER", nullable=False
    )  # HOST, CO_HOST, MEMBER
    status: Mapped[str] = mapped_column(
        String(30), default="ACTIVE", nullable=False
    )  # ACTIVE, LEFT, REMOVED
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("activity_id", "user_id", name="uq_activity_participant"),
    )

    activity: Mapped["Activity"] = relationship("Activity", back_populates="participants")
    user: Mapped["User"] = relationship("User")


class JoinRequest(Base, TimestampMixin):
    __tablename__ = "join_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="PENDING", nullable=False, index=True
    )  # PENDING, ACCEPTED, REJECTED, WITHDRAWN
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    activity: Mapped["Activity"] = relationship("Activity", back_populates="join_requests")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by])

