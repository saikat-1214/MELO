from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.interests.models import ActivityCategory, Interest
from app.modules.interests.schemas import CategoryResponse, InterestResponse


class InterestService:
    async def get_categories(self, db: AsyncSession) -> List[CategoryResponse]:
        stmt = (
            select(ActivityCategory)
            .where(ActivityCategory.is_active.is_(True))
            .order_by(ActivityCategory.name)
        )
        res = await db.execute(stmt)
        return [
            CategoryResponse(
                id=c.id,
                name=c.name,
                slug=c.slug,
                description=c.description,
                icon=c.icon,
                is_active=c.is_active,
            )
            for c in res.scalars().all()
        ]

    async def get_interests(
        self, db: AsyncSession, category: Optional[str] = None
    ) -> List[InterestResponse]:
        stmt = select(Interest).order_by(Interest.category, Interest.name)
        if category:
            stmt = stmt.where(Interest.category.ilike(f"%{category}%"))
        res = await db.execute(stmt)
        return [
            InterestResponse(
                id=i.id,
                name=i.name,
                slug=i.slug,
                category=i.category,
                description=i.description,
                icon_name=i.icon_name,
                is_system_defined=i.is_system_defined,
            )
            for i in res.scalars().all()
        ]


interest_service = InterestService()
