"""create_activities_and_participation_tables

Revision ID: 20261112_0002
Revises: 20261112_0001
Create Date: 2026-11-12 11:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '20261112_0002'
down_revision: Union[str, None] = '20261112_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. activities table
    op.create_table(
        'activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('host_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('activity_categories.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('location_landmark', sa.String(length=255), nullable=False),
        sa.Column('approx_latitude', sa.Float(), nullable=True),
        sa.Column('approx_longitude', sa.Float(), nullable=True),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('min_participants', sa.Integer(), server_default='2', nullable=False),
        sa.Column('max_participants', sa.Integer(), server_default='10', nullable=False),
        sa.Column('status', sa.String(length=30), server_default='PUBLISHED', nullable=False),
        sa.Column('rules', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('min_participants >= 2', name='check_min_participants_at_least_2'),
        sa.CheckConstraint('max_participants >= min_participants AND max_participants <= 100', name='check_max_participants_capacity_range'),
    )
    op.create_index('ix_activities_host_id', 'activities', ['host_id'])
    op.create_index('ix_activities_category_id', 'activities', ['category_id'])
    op.create_index('ix_activities_city', 'activities', ['city'])
    op.create_index('ix_activities_start_time', 'activities', ['start_time'])
    op.create_index('ix_activities_status', 'activities', ['status'])
    op.create_index('ix_activities_title', 'activities', ['title'])

    # 2. activity_participants table
    op.create_table(
        'activity_participants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('activities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(length=30), server_default='MEMBER', nullable=False),
        sa.Column('status', sa.String(length=30), server_default='ACTIVE', nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('activity_id', 'user_id', name='uq_activity_participant'),
    )
    op.create_index('ix_activity_participants_activity_id', 'activity_participants', ['activity_id'])
    op.create_index('ix_activity_participants_user_id', 'activity_participants', ['user_id'])

    # 3. join_requests table
    op.create_table(
        'join_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('activities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=30), server_default='PENDING', nullable=False),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('ix_join_requests_activity_id', 'join_requests', ['activity_id'])
    op.create_index('ix_join_requests_user_id', 'join_requests', ['user_id'])
    op.create_index('ix_join_requests_status', 'join_requests', ['status'])


def downgrade() -> None:
    op.drop_table('join_requests')
    op.drop_table('activity_participants')
    op.drop_table('activities')

