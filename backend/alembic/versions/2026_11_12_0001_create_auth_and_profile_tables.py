"""create_auth_and_profile_tables

Revision ID: 20261112_0001
Revises: 
Create Date: 2026-11-12 05:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '20261112_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('is_admin', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # 2. user_profiles
    op.create_table(
        'user_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(length=50), nullable=True),
        sa.Column('general_location', sa.String(length=150), nullable=False),
        sa.Column('approx_latitude', sa.Float(), nullable=True),
        sa.Column('approx_longitude', sa.Float(), nullable=True),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('languages', sa.JSON(), server_default=sa.text("'[]'::json"), nullable=False),
        sa.Column('visibility_scope', sa.String(length=30), server_default='PUBLIC', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('age >= 18', name='check_minimum_age_18'),
    )
    op.create_index('idx_user_profiles_user_id', 'user_profiles', ['user_id'], unique=True)
    op.create_index('idx_user_profiles_location', 'user_profiles', ['general_location'], unique=False)

    # 3. activity_categories
    op.create_table(
        'activity_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=80), nullable=False),
        sa.Column('slug', sa.String(length=80), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
    )
    op.create_index('idx_categories_slug', 'activity_categories', ['slug'], unique=True)
    op.create_index('idx_categories_name', 'activity_categories', ['name'], unique=True)

    # 4. interests
    op.create_table(
        'interests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=80), nullable=False),
        sa.Column('slug', sa.String(length=80), nullable=False),
        sa.Column('category', sa.String(length=80), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon_name', sa.String(length=50), server_default='tag', nullable=False),
        sa.Column('is_system_defined', sa.Boolean(), server_default=sa.text('true'), nullable=False),
    )
    op.create_index('idx_interests_slug', 'interests', ['slug'], unique=True)
    op.create_index('idx_interests_name', 'interests', ['name'], unique=True)
    op.create_index('idx_interests_category', 'interests', ['category'], unique=False)

    # 5. user_interests
    op.create_table(
        'user_interests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('interest_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('interests.id', ondelete='CASCADE'), nullable=False),
        sa.Column('proficiency_level', sa.Integer(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('user_id', 'interest_id', name='uq_user_interest'),
        sa.CheckConstraint('proficiency_level >= 1 AND proficiency_level <= 5', name='check_proficiency_range'),
    )
    op.create_index('idx_user_interests_user', 'user_interests', ['user_id'])
    op.create_index('idx_user_interests_interest', 'user_interests', ['interest_id'])

    # 6. user_availability
    op.create_table(
        'user_availability',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=True),
        sa.Column('time_slot', sa.String(length=30), nullable=False),
        sa.Column('specific_date', sa.Date(), nullable=True),
    )
    op.create_index('idx_user_availability_lookup', 'user_availability', ['user_id', 'day_of_week', 'time_slot'])


def downgrade() -> None:
    op.drop_table('user_availability')
    op.drop_table('user_interests')
    op.drop_table('interests')
    op.drop_table('activity_categories')
    op.drop_table('user_profiles')
    op.drop_table('users')
