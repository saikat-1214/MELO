import uuid
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("socialconnect.websockets")


class ConnectionManager:
    def __init__(self):
        # Maps conversation_id -> set of active WebSockets
        self.active_rooms: Dict[uuid.UUID, Set[WebSocket]] = {}

    async def connect(self, conversation_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        if conversation_id not in self.active_rooms:
            self.active_rooms[conversation_id] = set()
        self.active_rooms[conversation_id].add(websocket)
        logger.info(f"WebSocket client connected to conversation {conversation_id}. Total: {len(self.active_rooms[conversation_id])}")

    def disconnect(self, conversation_id: uuid.UUID, websocket: WebSocket):
        if conversation_id in self.active_rooms:
            self.active_rooms[conversation_id].discard(websocket)
            if not self.active_rooms[conversation_id]:
                del self.active_rooms[conversation_id]
        logger.info(f"WebSocket client disconnected from conversation {conversation_id}.")

    async def broadcast_to_room(self, conversation_id: uuid.UUID, message_dict: dict):
        if conversation_id not in self.active_rooms:
            return

        dead_sockets = set()
        for connection in self.active_rooms[conversation_id]:
            try:
                await connection.send_json(message_dict)
            except Exception as e:
                logger.warning(f"Failed to send WS message: {e}")
                dead_sockets.add(connection)

        for dead in dead_sockets:
            self.disconnect(conversation_id, dead)


manager = ConnectionManager()

