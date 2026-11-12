import uuid
from sqlalchemy import (
    String, Text, Boolean, Integer, ForeignKey, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, TimestampMixin


class ActivityCategory(Base):
    __tablename__ = "activity_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    icon: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Interest(Base):
    __tablename__ = "interests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    icon_name: Mapped[str] = mapped_column(String(50), default="tag", nullable=False)
    is_system_defined: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user_interests: Mapped[list["UserInterest"]] = relationship(
        "UserInterest", back_populates="interest", cascade="all, delete-orphan"
    )


class UserInterest(Base, TimestampMixin):
    __tablename__ = "user_interests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    interest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("interests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    proficiency_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "interest_id", name="uq_user_interest"),
        CheckConstraint("proficiency_level >= 1 AND proficiency_level <= 5", name="check_proficiency_range"),
    )

    user: Mapped["User"] = relationship("User", back_populates="user_interests")
    interest: Mapped["Interest"] = relationship("Interest", back_populates="user_interests")
