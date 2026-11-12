from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user
from app.modules.users.models import User
from app.modules.authentication.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenRefreshRequest,
    TokenResponse,
    UserMeResponse,
    EmailCheckResponse,
    VerifyOtpRequest,
    ResendOtpRequest,
    VerifyOtpResponse,
)
from app.modules.authentication.service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/check-email", response_model=EmailCheckResponse)
async def check_email_availability(
    email: str = Query(..., description="Email address to validate for deliverability and availability"),
    db: AsyncSession = Depends(get_db),
):
    """Pre-flight check for email MX deliverability, syntax, disposable domains, and duplicate registration."""
    return await auth_service.check_email(db, email)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    req: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Registers a new user account, sends a 6-digit email OTP verification code, and returns session tokens."""
    return await auth_service.register(db, req)


@router.post("/verify-otp", response_model=VerifyOtpResponse)
async def verify_email_otp(
    req: VerifyOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verifies the 6-digit OTP code and marks the user's email as verified."""
    return await auth_service.verify_email_otp(db, req)


@router.post("/resend-otp")
async def resend_email_otp(
    req: ResendOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Resends a new 6-digit email verification code with rate-limit protection."""
    return await auth_service.resend_verification_otp(db, req)


@router.post("/login", response_model=TokenResponse)
async def login(
    req: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticates user credentials and issues short-lived access and refresh tokens."""
    return await auth_service.login(db, req)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    req: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Rotates refresh tokens and generates a new access token."""
    return await auth_service.refresh_tokens(db, req)


@router.get("/me", response_model=UserMeResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Retrieves identity and onboarding profile status of the authenticated caller."""
    return await auth_service.get_me(current_user)


@router.post("/deactivate")
async def deactivate_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-deactivates the caller's account, invalidating future session operations."""
    return await auth_service.deactivate(db, current_user)
