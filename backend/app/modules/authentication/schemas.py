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
    is_verified: bool = False
    dev_otp: Optional[str] = None


class UserMeResponse(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    is_verified: bool
    is_admin: bool
    has_profile: bool
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class EmailCheckResponse(BaseModel):
    is_valid: bool
    is_available: bool
    normalized_email: Optional[str] = None
    suggestion: Optional[str] = None
    error: Optional[str] = None


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")


class ResendOtpRequest(BaseModel):
    email: EmailStr


class VerifyOtpResponse(BaseModel):
    success: bool
    message: str
    is_verified: bool
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
