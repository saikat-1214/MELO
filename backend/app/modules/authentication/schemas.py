import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: uuid.UUID
    email: str
    is_onboarded: bool


class UserMeResponse(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    is_verified: bool
    is_admin: bool
    has_profile: bool
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
