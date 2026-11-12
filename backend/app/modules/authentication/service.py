import uuid
import secrets
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from app.core.config import settings
from app.modules.users.models import User
from app.modules.authentication.models import EmailVerificationCode
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
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.shared.exceptions.base import (
    ConflictException,
    UnauthorizedException,
    ForbiddenException,
    BadRequestException,
)
from app.shared.utils.email_verifier import verify_email_address
from app.shared.utils.email_sender import send_verification_email

logger = logging.getLogger("auth_service")


def generate_otp() -> str:
    """Generates a secure 6-digit numeric OTP code."""
    return f"{secrets.randbelow(900000) + 100000:06d}"


class AuthService:
    async def check_email(self, db: AsyncSession, email: str) -> EmailCheckResponse:
        """
        Validates email format, domain MX deliverability, disposable domain checks,
        and availability in database.
        """
        is_valid, normalized_or_error, suggestion, error_code = verify_email_address(
            email, check_mx=True
        )
        if not is_valid:
            return EmailCheckResponse(
                is_valid=False,
                is_available=False,
                normalized_email=None,
                suggestion=suggestion,
                error=normalized_or_error,
            )

        clean_email = normalized_or_error.lower().strip()

        # Check if email is already taken
        stmt = select(User).where(User.email == clean_email)
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            return EmailCheckResponse(
                is_valid=True,
                is_available=False,
                normalized_email=clean_email,
                suggestion=None,
                error="An account with this email address already exists.",
            )

        return EmailCheckResponse(
            is_valid=True,
            is_available=True,
            normalized_email=clean_email,
            suggestion=suggestion,
            error=None,
        )

    async def register(self, db: AsyncSession, req: UserRegisterRequest) -> TokenResponse:
        """
        Registers a new user account, sends a 6-digit email OTP verification code,
        and returns authentication tokens.
        """
        # 1. Verify email syntax, deliverability, and block disposable domains
        is_valid, normalized_or_error, suggestion, error_code = verify_email_address(req.email)
        if not is_valid:
            raise BadRequestException(
                message=normalized_or_error,
                details={"suggestion": suggestion, "code": error_code},
            )

        clean_email = normalized_or_error.lower().strip()

        # 2. Check if email is already registered
        stmt = select(User).where(User.email == clean_email)
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            raise ConflictException(f"An account with email {clean_email} already exists.")

        # 3. Create user
        hashed_pw = get_password_hash(req.password)
        new_user = User(
            email=clean_email,
            hashed_password=hashed_pw,
            is_active=True,
            is_verified=False,
            is_admin=False,
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # 4. Generate 6-digit OTP and store in database
        otp_code = generate_otp()
        now_utc = datetime.now(timezone.utc)
        verification_code = EmailVerificationCode(
            email=clean_email,
            code=otp_code,
            expires_at=now_utc + timedelta(minutes=15),
            is_used=False,
            attempts=0,
        )
        db.add(verification_code)
        await db.commit()

        # Send real verification email via SMTP
        await send_verification_email(clean_email, otp_code)

        # Log OTP clearly for terminal visibility
        logger.info(f"📧 [EMAIL VERIFICATION OTP] Code for {clean_email}: {otp_code}")
        print(f"\n=======================================================")
        print(f" 🔑 SOCIALCONNECT EMAIL VERIFICATION CODE")
        print(f" To: {clean_email}")
        print(f" OTP Code: {otp_code} (Valid for 15 minutes)")
        print(f"=======================================================\n")

        # 5. Generate session tokens
        user_claims = {"sub": str(new_user.id), "email": new_user.email}
        access_token = create_access_token(user_claims)
        refresh_token = create_refresh_token(user_claims)

        smtp_configured = bool(
            settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD
        )
        dev_code = otp_code if (settings.ENVIRONMENT == "development" or not smtp_configured) else None

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_id=new_user.id,
            email=new_user.email,
            is_onboarded=False,
            is_verified=False,
            dev_otp=dev_code,
        )

    async def verify_email_otp(
        self, db: AsyncSession, req: VerifyOtpRequest
    ) -> VerifyOtpResponse:
        """
        Validates the 6-digit verification OTP and marks the user account as verified.
        """
        clean_email = req.email.lower().strip()

        # Find most recent active code
        stmt = (
            select(EmailVerificationCode)
            .where(
                EmailVerificationCode.email == clean_email,
                EmailVerificationCode.is_used == False,
            )
            .order_by(EmailVerificationCode.created_at.desc())
        )
        res = await db.execute(stmt)
        code_record = res.scalars().first()

        if not code_record:
            raise BadRequestException(
                "No active verification code found for this email. Please request a new code."
            )

        now_utc = datetime.now(timezone.utc)
        expires_at = code_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if now_utc > expires_at:
            raise BadRequestException(
                "Verification code has expired. Please click 'Resend Code' to receive a new one."
            )

        if code_record.attempts >= 5:
            raise BadRequestException(
                "Too many incorrect attempts. Please request a new verification code."
            )

        if code_record.code != req.code.strip():
            code_record.attempts += 1
            await db.commit()
            remaining = 5 - code_record.attempts
            raise BadRequestException(
                f"Invalid verification code. {remaining} attempt(s) remaining."
            )

        # Success - mark code as used and user as verified
        code_record.is_used = True

        stmt_user = select(User).where(User.email == clean_email)
        res_user = await db.execute(stmt_user)
        user = res_user.scalar_one_or_none()
        if not user:
            raise BadRequestException("User account not found.")

        user.is_verified = True
        await db.commit()
        await db.refresh(user)

        user_claims = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(user_claims)
        refresh_token = create_refresh_token(user_claims)

        return VerifyOtpResponse(
            success=True,
            message="Email successfully verified! Welcome to SocialConnect.",
            is_verified=True,
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def resend_verification_otp(
        self, db: AsyncSession, req: ResendOtpRequest
    ) -> dict:
        """
        Generates and sends a new 6-digit OTP code with a 60-second rate limit.
        """
        clean_email = req.email.lower().strip()

        # Check rate limit against most recent code
        stmt = (
            select(EmailVerificationCode)
            .where(EmailVerificationCode.email == clean_email)
            .order_by(EmailVerificationCode.created_at.desc())
        )
        res = await db.execute(stmt)
        recent = res.scalars().first()

        now_utc = datetime.now(timezone.utc)
        if recent:
            created_at = recent.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            elapsed = (now_utc - created_at).total_seconds()
            if elapsed < 60:
                wait_secs = int(60 - elapsed)
                raise BadRequestException(
                    f"Please wait {wait_secs} second(s) before requesting another verification code."
                )
            recent.is_used = True

        # Generate and save new code
        otp_code = generate_otp()
        new_code = EmailVerificationCode(
            email=clean_email,
            code=otp_code,
            expires_at=now_utc + timedelta(minutes=15),
            is_used=False,
            attempts=0,
        )
        db.add(new_code)
        await db.commit()

        # Send real verification email via SMTP
        await send_verification_email(clean_email, otp_code)

        logger.info(f"📧 [EMAIL VERIFICATION OTP RESENT] Code for {clean_email}: {otp_code}")
        print(f"\n=======================================================")
        print(f" 🔑 SOCIALCONNECT EMAIL VERIFICATION CODE (RESENT)")
        print(f" To: {clean_email}")
        print(f" OTP Code: {otp_code} (Valid for 15 minutes)")
        print(f"=======================================================\n")

        smtp_configured = bool(
            settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD
        )
        dev_code = otp_code if (settings.ENVIRONMENT == "development" or not smtp_configured) else None

        return {
            "message": f"A new 6-digit verification code has been generated for {clean_email}.",
            "dev_otp": dev_code,
        }

    async def login(self, db: AsyncSession, req: UserLoginRequest) -> TokenResponse:
        stmt = (
            select(User)
            .options(selectinload(User.profile))
            .where(User.email == req.email.lower().strip())
        )
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user or not verify_password(req.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise ForbiddenException("This account has been deactivated.")

        user_claims = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(user_claims)
        refresh_token = create_refresh_token(user_claims)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            is_onboarded=user.profile is not None,
            is_verified=user.is_verified,
        )

    async def refresh_tokens(self, db: AsyncSession, req: TokenRefreshRequest) -> TokenResponse:
        try:
            payload = decode_token(req.refresh_token)
            if payload.get("type") != "refresh":
                raise UnauthorizedException("Invalid token type. Expected refresh token.")
            user_id_str = payload.get("sub")
            user_id = uuid.UUID(user_id_str)
        except (jwt.PyJWTError, ValueError):
            raise UnauthorizedException("Invalid or expired refresh token.")

        stmt = (
            select(User)
            .options(selectinload(User.profile))
            .where(User.id == user_id)
        )
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            raise UnauthorizedException("User account not found.")
        if not user.is_active:
            raise ForbiddenException("Account has been deactivated.")

        user_claims = {"sub": str(user.id), "email": user.email}
        new_access_token = create_access_token(user_claims)
        new_refresh_token = create_refresh_token(user_claims)

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            is_onboarded=user.profile is not None,
            is_verified=user.is_verified,
        )

    async def get_me(self, user: User) -> UserMeResponse:
        return UserMeResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            is_verified=user.is_verified,
            is_admin=user.is_admin,
            has_profile=user.profile is not None,
            display_name=user.profile.display_name if user.profile else None,
            avatar_url=user.profile.avatar_url if user.profile else None,
        )

    async def deactivate(self, db: AsyncSession, user: User) -> dict:
        user.is_active = False
        await db.commit()
        return {"message": "Account successfully deactivated."}


auth_service = AuthService()
