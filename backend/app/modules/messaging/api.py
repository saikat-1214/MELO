import uuid
import logging
from typing import List
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.core.security import decode_token
from app.modules.users.models import User
from app.modules.messaging.schemas import (
    MessageCreateRequest,
    MessageResponse,
    ConversationSummaryResponse,
    ConversationDetailResponse,
)
from app.modules.messaging.service import MessagingService
from app.modules.messaging.websocket_manager import manager
from app.db.session import AsyncSessionLocal

logger = logging.getLogger("socialconnect.messaging")
router = APIRouter(tags=["Messaging & Group Chat"])


@router.get("/conversations", response_model=List[ConversationSummaryResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all active group conversations the logged-in user belongs to.
    """
    return await MessagingService.list_user_conversations(db, user_id=current_user.id)


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get conversation details and members.
    """
    return await MessagingService.get_conversation_detail(
        db, conversation_id=conversation_id, user_id=current_user.id
    )


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get historical messages for an outing group chat.
    """
    return await MessagingService.get_messages(
        db, conversation_id=conversation_id, user_id=current_user.id, limit=limit
    )


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    conversation_id: uuid.UUID,
    payload: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message to an authorized group chat.
    Content is scanned for community safety standards before delivery.
    """
    return await MessagingService.send_message(
        db, conversation_id=conversation_id, sender=current_user, content=payload.content
    )


@router.websocket("/ws/conversations/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: uuid.UUID,
    token: str = Query(...),
):
    """
    Real-time WebSocket endpoint for group chat.
    Authenticates via JWT token query parameter.
    """
    # 1. Validate JWT Token
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = uuid.UUID(user_id_str)
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Connect client
    await manager.connect(conversation_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("content")
            if content and isinstance(content, str):
                async with AsyncSessionLocal() as session:
                    stmt = select(User).options(joinedload(User.profile)).where(User.id == user_id)
                    user_res = await session.execute(stmt)
                    user = user_res.scalar_one_or_none()
                    if user:
                        await MessagingService.send_message(
                            db=session,
                            conversation_id=conversation_id,
                            sender=user,
                            content=content,
                        )
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        manager.disconnect(conversation_id, websocket)

