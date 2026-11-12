import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import (
    String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modules.activities.models import Activity
    from app.modules.users.models import User


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    activity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        nullable=True,
        unique=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    conversation_type: Mapped[str] = mapped_column(
        String(30), default="GROUP", nullable=False
    )  # GROUP, DIRECT

    activity: Mapped[Optional["Activity"]] = relationship("Activity")
    members: Mapped[List["ConversationMember"]] = relationship(
        "ConversationMember", back_populates="conversation", cascade="all, delete-orphan"
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at"
    )


class ConversationMember(Base):
    __tablename__ = "conversation_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
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
    )  # HOST, MEMBER
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    last_read_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("conversation_id", "user_id", name="uq_conversation_member"),
    )

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="members")
    user: Mapped["User"] = relationship("User")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(
        String(30), default="USER", nullable=False
    )  # USER, SYSTEM
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")
    sender: Mapped[Optional["User"]] = relationship("User")

