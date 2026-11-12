import uuid
from datetime import date
from typing import Optional, List
from sqlalchemy import (
    String, Text, Boolean, Integer, Date, Float, ForeignKey, CheckConstraint, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    user_interests: Mapped[List["UserInterest"]] = relationship(
        "UserInterest", back_populates="user", cascade="all, delete-orphan"
    )
    availability: Mapped[List["UserAvailability"]] = relationship(
        "UserAvailability", back_populates="user", cascade="all, delete-orphan"
    )


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    general_location: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    approx_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    approx_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    languages: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    visibility_scope: Mapped[str] = mapped_column(
        String(30), default="PUBLIC", nullable=False
    )

    __table_args__ = (
        CheckConstraint("age >= 18", name="check_minimum_age_18"),
    )

    user: Mapped["User"] = relationship("User", back_populates="profile")


class UserAvailability(Base):
    __tablename__ = "user_availability"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    day_of_week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 0=Sunday, 6=Saturday
    time_slot: Mapped[str] = mapped_column(String(30), nullable=False)  # MORNING, AFTERNOON, EVENING, NIGHT, ALL_DAY
    specific_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="availability")
