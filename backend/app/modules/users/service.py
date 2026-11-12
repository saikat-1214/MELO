import uuid
from datetime import date
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.users.models import User, UserProfile, UserAvailability
from app.modules.interests.models import Interest, UserInterest
from app.modules.users.schemas import (
    OnboardingRequest,
    UserProfileUpdate,
    UserProfileResponse,
    PublicUserProfileResponse,
    InterestDetailSchema,
    AvailabilitySlotSchema,
)
from app.shared.exceptions.base import NotFoundException, BadRequestException


def calculate_age(birth_date: date) -> int:
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


class ProfileService:
    async def complete_onboarding(
        self, db: AsyncSession, user: User, req: OnboardingRequest
    ) -> UserProfileResponse:
        age = calculate_age(req.birth_date)
        if age < 18:
            raise BadRequestException("You must be at least 18 years old to use SocialConnect.")

        # Check existing profile
        stmt = (
            select(UserProfile)
            .where(UserProfile.user_id == user.id)
        )
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()

        if profile:
            profile.display_name = req.display_name
            profile.bio = req.bio
            profile.birth_date = req.birth_date
            profile.age = age
            profile.gender = req.gender
            profile.general_location = req.general_location
            profile.languages = req.languages
        else:
            profile = UserProfile(
                user_id=user.id,
                display_name=req.display_name,
                bio=req.bio,
                birth_date=req.birth_date,
                age=age,
                gender=req.gender,
                general_location=req.general_location,
                languages=req.languages,
                visibility_scope="PUBLIC",
            )
            db.add(profile)

        # Clear and recreate user interests
        await db.execute(delete(UserInterest).where(UserInterest.user_id == user.id))
        for item in req.interests:
            ui = UserInterest(
                user_id=user.id,
                interest_id=item.interest_id,
                proficiency_level=item.proficiency_level,
            )
            db.add(ui)

        # Clear and recreate user availability
        await db.execute(delete(UserAvailability).where(UserAvailability.user_id == user.id))
        for slot in req.availability:
            avail = UserAvailability(
                user_id=user.id,
                day_of_week=slot.day_of_week,
                time_slot=slot.time_slot.upper(),
            )
            db.add(avail)

        await db.commit()
        return await self.get_profile_by_user_id(db, user.id, user.email)

    async def get_profile_by_user_id(
        self, db: AsyncSession, user_id: uuid.UUID, user_email: str
    ) -> UserProfileResponse:
        # Load user with profile, interests, and availability
        stmt = (
            select(UserProfile)
            .where(UserProfile.user_id == user_id)
        )
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()
        if not profile:
            raise NotFoundException("User profile has not been created yet.")

        # Load interests
        interest_stmt = (
            select(UserInterest, Interest)
            .join(Interest, UserInterest.interest_id == Interest.id)
            .where(UserInterest.user_id == user_id)
        )
        interest_res = await db.execute(interest_stmt)
        interest_items = [
            InterestDetailSchema(
                id=interest.id,
                name=interest.name,
                slug=interest.slug,
                category=interest.category,
                icon_name=interest.icon_name,
                proficiency_level=ui.proficiency_level,
            )
            for ui, interest in interest_res.all()
        ]

        # Load availability
        avail_stmt = (
            select(UserAvailability)
            .where(UserAvailability.user_id == user_id)
        )
        avail_res = await db.execute(avail_stmt)
        avail_items = [
            AvailabilitySlotSchema(
                day_of_week=a.day_of_week,
                time_slot=a.time_slot,
            )
            for a in avail_res.scalars().all()
        ]

        return UserProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            email=user_email,
            display_name=profile.display_name,
            bio=profile.bio,
            birth_date=profile.birth_date,
            age=profile.age,
            gender=profile.gender,
            general_location=profile.general_location,
            languages=profile.languages,
            visibility_scope=profile.visibility_scope,
            avatar_url=profile.avatar_url,
            interests=interest_items,
            availability=avail_items,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    async def get_public_profile(
        self, db: AsyncSession, target_user_id: uuid.UUID
    ) -> PublicUserProfileResponse:
        stmt = select(UserProfile).where(UserProfile.user_id == target_user_id)
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()
        if not profile:
            raise NotFoundException("User profile not found.")

        # Load interests
        interest_stmt = (
            select(UserInterest, Interest)
            .join(Interest, UserInterest.interest_id == Interest.id)
            .where(UserInterest.user_id == target_user_id)
        )
        interest_res = await db.execute(interest_stmt)
        interest_items = [
            InterestDetailSchema(
                id=interest.id,
                name=interest.name,
                slug=interest.slug,
                category=interest.category,
                icon_name=interest.icon_name,
                proficiency_level=ui.proficiency_level,
            )
            for ui, interest in interest_res.all()
        ]

        return PublicUserProfileResponse(
            user_id=profile.user_id,
            display_name=profile.display_name,
            bio=profile.bio,
            age=profile.age,
            gender=profile.gender,
            general_location=profile.general_location,
            languages=profile.languages,
            avatar_url=profile.avatar_url,
            interests=interest_items,
        )

    async def update_profile(
        self, db: AsyncSession, user: User, req: UserProfileUpdate
    ) -> UserProfileResponse:
        stmt = select(UserProfile).where(UserProfile.user_id == user.id)
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()
        if not profile:
            raise NotFoundException("Profile not found. Please complete onboarding first.")

        if req.display_name is not None:
            profile.display_name = req.display_name
        if req.bio is not None:
            profile.bio = req.bio
        if req.general_location is not None:
            profile.general_location = req.general_location
        if req.languages is not None:
            profile.languages = req.languages
        if req.visibility_scope is not None:
            profile.visibility_scope = req.visibility_scope
        if req.avatar_url is not None:
            profile.avatar_url = req.avatar_url

        await db.commit()
        return await self.get_profile_by_user_id(db, user.id, user.email)


profile_service = ProfileService()
