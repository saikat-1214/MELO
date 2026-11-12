import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from app.modules.users.models import User
from app.modules.authentication.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenRefreshRequest,
    TokenResponse,
    UserMeResponse,
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


class AuthService:
    async def register(self, db: AsyncSession, req: UserRegisterRequest) -> TokenResponse:
        # Verify email syntax, deliverability, and block disposable domains
        is_valid, normalized_or_error, suggestion, error_code = verify_email_address(req.email)
        if not is_valid:
            raise BadRequestException(
                message=normalized_or_error,
                details={"suggestion": suggestion, "code": error_code},
            )

        clean_email = normalized_or_error.lower().strip()

        # Check if email is already registered
        stmt = select(User).where(User.email == clean_email)
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            raise ConflictException(f"An account with email {clean_email} already exists.")

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

        user_claims = {"sub": str(new_user.id), "email": new_user.email}
        access_token = create_access_token(user_claims)
        refresh_token = create_refresh_token(user_claims)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_id=new_user.id,
            email=new_user.email,
            is_onboarded=False,
        )

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
