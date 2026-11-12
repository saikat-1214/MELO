import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User, UserProfile
from app.modules.activities.models import Activity
from app.modules.messaging.models import Conversation, ConversationMember, Message
from app.modules.messaging.schemas import (
    MessageResponse,
    ConversationSummaryResponse,
    ConversationDetailResponse,
    ConversationMemberSummary,
)
from app.modules.messaging.websocket_manager import manager
from app.modules.notifications.service import NotificationService
from app.shared.utils.username_filter import is_friendly_username
from app.shared.exceptions.base import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
)


class MessagingService:
    @staticmethod
    async def get_or_create_activity_conversation(
        db: AsyncSession,
        activity_id: uuid.UUID,
        title: str,
        host_id: uuid.UUID,
    ) -> Conversation:
        # Check if conversation already exists for this activity
        stmt = select(Conversation).where(Conversation.activity_id == activity_id)
        res = await db.execute(stmt)
        conv = res.scalar_one_or_none()

        if not conv:
            conv = Conversation(
                activity_id=activity_id,
                title=f"Chat: {title}",
                conversation_type="GROUP",
            )
            db.add(conv)
            await db.flush()

            # Add host as conversation member
            host_member = ConversationMember(
                conversation_id=conv.id,
                user_id=host_id,
                role="HOST",
                joined_at=datetime.now(timezone.utc),
            )
            db.add(host_member)

            # System welcome message
            welcome_msg = Message(
                conversation_id=conv.id,
                sender_id=None,
                content=f"Welcome to the group chat for '{title}'! Coordinate meeting details safely.",
                message_type="SYSTEM",
            )
            db.add(welcome_msg)
            await db.commit()
            await db.refresh(conv)

        return conv

    @staticmethod
    async def add_member_to_conversation(
        db: AsyncSession,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        role: str = "MEMBER",
    ) -> ConversationMember:
        stmt = select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == user_id,
        )
        res = await db.execute(stmt)
        member = res.scalar_one_or_none()

        if not member:
            member = ConversationMember(
                conversation_id=conversation_id,
                user_id=user_id,
                role=role,
                joined_at=datetime.now(timezone.utc),
            )
            db.add(member)

            # Announce in chat
            user_stmt = select(User).options(joinedload(User.profile)).where(User.id == user_id)
            user_res = await db.execute(user_stmt)
            u = user_res.scalar_one_or_none()
            display_name = u.profile.display_name if (u and u.profile) else "A new member"

            sys_msg = Message(
                conversation_id=conversation_id,
                sender_id=None,
                content=f"{display_name} has joined the outing group chat.",
                message_type="SYSTEM",
            )
            db.add(sys_msg)
            await db.commit()

            # Broadcast sys message
            await manager.broadcast_to_room(
                conversation_id,
                {
                    "id": str(sys_msg.id),
                    "conversation_id": str(conversation_id),
                    "sender_id": None,
                    "sender_name": "System",
                    "sender_avatar": None,
                    "content": sys_msg.content,
                    "message_type": "SYSTEM",
                    "created_at": sys_msg.created_at.isoformat(),
                },
            )

        return member

    @staticmethod
    async def list_user_conversations(
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[ConversationSummaryResponse]:
        # Fetch conversations where user is a member
        stmt = (
            select(Conversation)
            .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
            .options(
                selectinload(Conversation.members).joinedload(ConversationMember.user).joinedload(User.profile),
                selectinload(Conversation.messages).joinedload(Message.sender).joinedload(User.profile),
            )
            .where(ConversationMember.user_id == user_id)
            .order_by(desc(Conversation.updated_at))
        )
        res = await db.execute(stmt)
        conversations = res.unique().scalars().all()

        results = []
        for conv in conversations:
            # Last message
            last_msg = conv.messages[-1] if conv.messages else None
            last_msg_resp = None
            if last_msg:
                sender_profile = last_msg.sender.profile if last_msg.sender else None
                last_msg_resp = MessageResponse(
                    id=last_msg.id,
                    conversation_id=conv.id,
                    sender_id=last_msg.sender_id,
                    sender_name=sender_profile.display_name if sender_profile else ("System" if not last_msg.sender_id else "User"),
                    sender_avatar=sender_profile.avatar_url if sender_profile else None,
                    content=last_msg.content,
                    message_type=last_msg.message_type,
                    created_at=last_msg.created_at,
                )

            results.append(
                ConversationSummaryResponse(
                    id=conv.id,
                    activity_id=conv.activity_id,
                    title=conv.title,
                    conversation_type=conv.conversation_type,
                    member_count=len(conv.members),
                    last_message=last_msg_resp,
                    created_at=conv.created_at,
                )
            )

        return results

    @staticmethod
    async def get_conversation_detail(
        db: AsyncSession,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ConversationDetailResponse:
        # Check membership
        member_stmt = select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == user_id,
        )
        member_res = await db.execute(member_stmt)
        if not member_res.scalar_one_or_none():
            raise ForbiddenException("You are not a member of this chat conversation.")

        stmt = (
            select(Conversation)
            .options(
                selectinload(Conversation.members).joinedload(ConversationMember.user).joinedload(User.profile),
                selectinload(Conversation.messages).joinedload(Message.sender).joinedload(User.profile),
            )
            .where(Conversation.id == conversation_id)
        )
        res = await db.execute(stmt)
        conv = res.scalar_one_or_none()
        if not conv:
            raise NotFoundException("Conversation not found.")

        last_msg = conv.messages[-1] if conv.messages else None
        last_msg_resp = None
        if last_msg:
            sender_profile = last_msg.sender.profile if last_msg.sender else None
            last_msg_resp = MessageResponse(
                id=last_msg.id,
                conversation_id=conv.id,
                sender_id=last_msg.sender_id,
                sender_name=sender_profile.display_name if sender_profile else ("System" if not last_msg.sender_id else "User"),
                sender_avatar=sender_profile.avatar_url if sender_profile else None,
                content=last_msg.content,
                message_type=last_msg.message_type,
                created_at=last_msg.created_at,
            )

        member_summaries = []
        for m in conv.members:
            p = m.user.profile if m.user else None
            member_summaries.append(
                ConversationMemberSummary(
                    user_id=m.user_id,
                    display_name=p.display_name if p else "User",
                    avatar_url=p.avatar_url if p else None,
                    role=m.role,
                )
            )

        return ConversationDetailResponse(
            id=conv.id,
            activity_id=conv.activity_id,
            title=conv.title,
            conversation_type=conv.conversation_type,
            member_count=len(conv.members),
            last_message=last_msg_resp,
            created_at=conv.created_at,
            members=member_summaries,
        )

    @staticmethod
    async def get_messages(
        db: AsyncSession,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        limit: int = 50,
    ) -> List[MessageResponse]:
        # Verify membership
        member_stmt = select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == user_id,
        )
        member_res = await db.execute(member_stmt)
        if not member_res.scalar_one_or_none():
            raise ForbiddenException("You are not a member of this chat conversation.")

        stmt = (
            select(Message)
            .options(joinedload(Message.sender).joinedload(User.profile))
            .where(Message.conversation_id == conversation_id, Message.is_deleted == False)
            .order_by(desc(Message.created_at))
            .limit(limit)
        )
        res = await db.execute(stmt)
        messages = res.scalars().all()

        responses = []
        for m in reversed(messages):
            sender_profile = m.sender.profile if m.sender else None
            responses.append(
                MessageResponse(
                    id=m.id,
                    conversation_id=m.conversation_id,
                    sender_id=m.sender_id,
                    sender_name=sender_profile.display_name if sender_profile else ("System" if not m.sender_id else "User"),
                    sender_avatar=sender_profile.avatar_url if sender_profile else None,
                    content=m.content,
                    message_type=m.message_type,
                    created_at=m.created_at,
                )
            )

        return responses

    @staticmethod
    async def send_message(
        db: AsyncSession,
        conversation_id: uuid.UUID,
        sender: User,
        content: str,
    ) -> MessageResponse:
        # Check membership
        member_stmt = select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == sender.id,
        )
        member_res = await db.execute(member_stmt)
        if not member_res.scalar_one_or_none():
            raise ForbiddenException("You are not a member of this chat conversation.")

        # Community safety check
        is_safe, violation = is_friendly_username(content)
        if not is_safe:
            raise BadRequestException(f"Message blocked by community safety filter: {violation}")

        now = datetime.now(timezone.utc)
        msg = Message(
            conversation_id=conversation_id,
            sender_id=sender.id,
            content=content.strip(),
            message_type="USER",
            created_at=now,
        )
        db.add(msg)

        # Update conversation timestamp
        conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
        conv_res = await db.execute(conv_stmt)
        conv = conv_res.scalar_one()
        conv.updated_at = now

        await db.commit()
        await db.refresh(msg)

        sender_profile = sender.profile
        resp = MessageResponse(
            id=msg.id,
            conversation_id=conversation_id,
            sender_id=sender.id,
            sender_name=sender_profile.display_name if sender_profile else "User",
            sender_avatar=sender_profile.avatar_url if sender_profile else None,
            content=msg.content,
            message_type=msg.message_type,
            created_at=msg.created_at,
        )

        # Broadcast via WebSocket
        await manager.broadcast_to_room(
            conversation_id,
            {
                "id": str(resp.id),
                "conversation_id": str(resp.conversation_id),
                "sender_id": str(resp.sender_id),
                "sender_name": resp.sender_name,
                "sender_avatar": resp.sender_avatar,
                "content": resp.content,
                "message_type": resp.message_type,
                "created_at": resp.created_at.isoformat(),
            },
        )

        return resp

