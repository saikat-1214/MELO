"""create_messaging_notifications_and_safety_tables

Revision ID: 20261112_0003
Revises: 20261112_0002
Create Date: 2026-11-12 12:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '20261112_0003'
down_revision: Union[str, None] = '20261112_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. conversations
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('activities.id', ondelete='CASCADE'), nullable=True),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('conversation_type', sa.String(length=30), server_default='GROUP', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_conversations_activity_id', 'conversations', ['activity_id'], unique=True)

    # 2. conversation_members
    op.create_table(
        'conversation_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(length=30), server_default='MEMBER', nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('last_read_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('conversation_id', 'user_id', name='uq_conversation_member'),
    )
    op.create_index('ix_conversation_members_conversation_id', 'conversation_members', ['conversation_id'])
    op.create_index('ix_conversation_members_user_id', 'conversation_members', ['user_id'])

    # 3. messages
    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('message_type', sa.String(length=30), server_default='USER', nullable=False),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('ix_messages_sender_id', 'messages', ['sender_id'])
    op.create_index('ix_messages_created_at', 'messages', ['created_at'])

    # 4. notifications
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(length=50), nullable=False),
        sa.Column('link_url', sa.String(length=255), nullable=True),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_notification_type', 'notifications', ['notification_type'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'])

    # 5. user_blocks
    op.create_table(
        'user_blocks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('blocker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('blocked_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('blocker_id', 'blocked_id', name='uq_user_block'),
    )
    op.create_index('ix_user_blocks_blocker_id', 'user_blocks', ['blocker_id'])
    op.create_index('ix_user_blocks_blocked_id', 'user_blocks', ['blocked_id'])

    # 6. reports
    op.create_table(
        'reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reported_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('activities.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reason', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=30), server_default='PENDING', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_reports_reporter_id', 'reports', ['reporter_id'])
    op.create_index('ix_reports_reported_user_id', 'reports', ['reported_user_id'])
    op.create_index('ix_reports_activity_id', 'reports', ['activity_id'])
    op.create_index('ix_reports_status', 'reports', ['status'])


def downgrade() -> None:
    op.drop_table('reports')
    op.drop_table('user_blocks')
    op.drop_table('notifications')
    op.drop_table('messages')
    op.drop_table('conversation_members')
    op.drop_table('conversations')

