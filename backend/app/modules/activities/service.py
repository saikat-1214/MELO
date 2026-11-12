import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User, UserProfile
from app.modules.interests.models import ActivityCategory, UserInterest, Interest
from app.modules.activities.models import Activity, ActivityParticipant, JoinRequest
from app.modules.activities.schemas import (
    ActivityCreateRequest,
    ActivityUpdateRequest,
    ActivitySummaryResponse,
    ActivityDetailResponse,
    ActivityListResponse,
    CategorySummary,
    HostSummary,
    ParticipantSummary,
    JoinRequestCreate,
    JoinRequestResponse,
    RequesterSummary,
    JoinRequestDecisionRequest,
    MyActivitiesOverviewResponse,
)
from app.shared.exceptions.base import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
)


def _build_host_summary(host: User) -> HostSummary:
    profile = host.profile
    return HostSummary(
        id=host.id,
        display_name=profile.display_name if profile else host.email.split("@")[0],
        avatar_url=profile.avatar_url if profile else None,
        general_location=profile.general_location if profile else None,
        age=profile.age if profile else None,
        bio=profile.bio if profile else None,
    )


def _build_category_summary(cat: ActivityCategory) -> CategorySummary:
    return CategorySummary(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        icon=cat.icon,
    )


def _build_activity_summary(
    act: Activity,
    viewer: Optional[User] = None,
    pending_request_user_ids: Optional[set] = None,
) -> ActivitySummaryResponse:
    # Filter active participants
    active_participants = [p for p in act.participants if p.status == "ACTIVE"]
    participant_count = len(active_participants)
    spots_left = max(0, act.max_participants - participant_count)

    # Determine viewer status
    viewer_status = "NONE"
    if viewer:
        if viewer.id == act.host_id:
            viewer_status = "HOST"
        elif any(p.user_id == viewer.id for p in active_participants):
            viewer_status = "MEMBER"
        elif pending_request_user_ids and viewer.id in pending_request_user_ids:
            viewer_status = "PENDING_REQUEST"
        else:
            # Check within loaded join_requests if present
            for req in act.join_requests:
                if req.user_id == viewer.id and req.status == "PENDING":
                    viewer_status = "PENDING_REQUEST"
                    break

    return ActivitySummaryResponse(
        id=act.id,
        title=act.title,
        description=act.description,
        city=act.city,
        location_landmark=act.location_landmark,
        approx_latitude=act.approx_latitude,
        approx_longitude=act.approx_longitude,
        start_time=act.start_time,
        end_time=act.end_time,
        min_participants=act.min_participants,
        max_participants=act.max_participants,
        status=act.status,
        rules=act.rules,
        created_at=act.created_at,
        category=_build_category_summary(act.category),
        host=_build_host_summary(act.host),
        participant_count=participant_count,
        spots_left=spots_left,
        viewer_status=viewer_status,
    )


def _build_requester_summary(user: User) -> RequesterSummary:
    profile = user.profile
    interest_names = []
    if hasattr(user, "user_interests") and user.user_interests:
        for ui in user.user_interests:
            if hasattr(ui, "interest") and ui.interest:
                interest_names.append(ui.interest.name)
    return RequesterSummary(
        id=user.id,
        display_name=profile.display_name if profile else user.email.split("@")[0],
        avatar_url=profile.avatar_url if profile else None,
        general_location=profile.general_location if profile else None,
        age=profile.age if profile else None,
        bio=profile.bio if profile else None,
        interests=interest_names,
    )


class ActivityService:
    @staticmethod
    async def create_activity(
        db: AsyncSession,
        host: User,
        payload: ActivityCreateRequest,
    ) -> ActivityDetailResponse:
        # 1. Verify category exists
        cat_stmt = select(ActivityCategory).where(ActivityCategory.id == payload.category_id)
        cat_res = await db.execute(cat_stmt)
        category = cat_res.scalar_one_or_none()
        if not category:
            raise NotFoundException("Activity category does not exist.")

        # 2. Create activity
        activity = Activity(
            host_id=host.id,
            category_id=category.id,
            title=payload.title,
            description=payload.description,
            city=payload.city,
            location_landmark=payload.location_landmark,
            approx_latitude=payload.approx_latitude,
            approx_longitude=payload.approx_longitude,
            start_time=payload.start_time,
            end_time=payload.end_time,
            min_participants=payload.min_participants,
            max_participants=payload.max_participants,
            status="PUBLISHED",
            rules=payload.rules,
        )
        db.add(activity)
        await db.flush()

        # 3. Automatically enroll host as active HOST participant
        host_participant = ActivityParticipant(
            activity_id=activity.id,
            user_id=host.id,
            role="HOST",
            status="ACTIVE",
            joined_at=datetime.now(timezone.utc),
        )
        db.add(host_participant)
        await db.flush()

        # 4. Automatically initialize group chat room for this activity
        from app.modules.messaging.service import MessagingService
        await MessagingService.get_or_create_activity_conversation(
            db, activity_id=activity.id, title=activity.title, host_id=host.id
        )

        await db.commit()

        # 5. Return detailed response
        return await ActivityService.get_activity_by_id(db, activity.id, viewer=host)

    @staticmethod
    async def get_activity_by_id(
        db: AsyncSession,
        activity_id: uuid.UUID,
        viewer: Optional[User] = None,
    ) -> ActivityDetailResponse:
        stmt = (
            select(Activity)
            .options(
                joinedload(Activity.category),
                joinedload(Activity.host).joinedload(User.profile),
                selectinload(Activity.participants).joinedload(ActivityParticipant.user).joinedload(User.profile),
                selectinload(Activity.join_requests),
            )
            .where(Activity.id == activity_id)
        )
        res = await db.execute(stmt)
        act = res.scalar_one_or_none()
        if not act:
            raise NotFoundException("Activity not found.")

        summary = _build_activity_summary(act, viewer=viewer)

        # Build participants list
        participant_list: List[ParticipantSummary] = []
        for p in act.participants:
            if p.status == "ACTIVE":
                u_profile = p.user.profile if p.user else None
                participant_list.append(
                    ParticipantSummary(
                        id=p.id,
                        user_id=p.user_id,
                        display_name=u_profile.display_name if u_profile else (p.user.email.split("@")[0] if p.user else "User"),
                        avatar_url=u_profile.avatar_url if u_profile else None,
                        general_location=u_profile.general_location if u_profile else None,
                        role=p.role,
                        joined_at=p.joined_at,
                    )
                )

        return ActivityDetailResponse(
            **summary.model_dump(),
            participants=participant_list,
        )

    @staticmethod
    async def list_activities(
        db: AsyncSession,
        category_id: Optional[uuid.UUID] = None,
        city: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[str] = "PUBLISHED",
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 12,
        viewer: Optional[User] = None,
    ) -> ActivityListResponse:
        conditions = []

        if status:
            conditions.append(Activity.status == status)
        if category_id:
            conditions.append(Activity.category_id == category_id)
        if city:
            conditions.append(Activity.city.ilike(f"%{city.strip()}%"))
        if search:
            q = f"%{search.strip()}%"
            conditions.append(or_(Activity.title.ilike(q), Activity.description.ilike(q)))
        if date_from:
            conditions.append(Activity.start_time >= date_from)
        if date_to:
            conditions.append(Activity.start_time <= date_to)

        # Filter out activities from bidirectionally blocked users
        if viewer:
            from app.modules.safety.service import SafetyService
            blocked_ids = await SafetyService.get_bidirectional_blocked_user_ids(db, viewer.id)
            if blocked_ids:
                conditions.append(Activity.host_id.not_in(list(blocked_ids)))

        # Count total
        count_stmt = select(func.count(Activity.id)).where(and_(*conditions))
        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Query items
        offset = (page - 1) * page_size
        stmt = (
            select(Activity)
            .options(
                joinedload(Activity.category),
                joinedload(Activity.host).joinedload(User.profile),
                selectinload(Activity.participants),
                selectinload(Activity.join_requests),
            )
            .where(and_(*conditions))
            .order_by(asc(Activity.start_time))
            .offset(offset)
            .limit(page_size)
        )
        res = await db.execute(stmt)
        activities = res.unique().scalars().all()

        items = [_build_activity_summary(a, viewer=viewer) for a in activities]
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        return ActivityListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @staticmethod
    async def update_activity(
        db: AsyncSession,
        activity_id: uuid.UUID,
        host: User,
        payload: ActivityUpdateRequest,
    ) -> ActivityDetailResponse:
        stmt = select(Activity).where(Activity.id == activity_id)
        res = await db.execute(stmt)
        act = res.scalar_one_or_none()
        if not act:
            raise NotFoundException("Activity not found.")

        if act.host_id != host.id and not host.is_admin:
            raise ForbiddenException("Only the activity host can modify this activity.")

        if payload.title is not None:
            act.title = payload.title
        if payload.description is not None:
            act.description = payload.description
        if payload.city is not None:
            act.city = payload.city
        if payload.location_landmark is not None:
            act.location_landmark = payload.location_landmark
        if payload.start_time is not None:
            act.start_time = payload.start_time
        if payload.end_time is not None:
            act.end_time = payload.end_time
        if payload.min_participants is not None:
            act.min_participants = payload.min_participants
        if payload.max_participants is not None:
            act.max_participants = payload.max_participants
        if payload.rules is not None:
            act.rules = payload.rules

        act.updated_at = datetime.now(timezone.utc)
        await db.commit()

        return await ActivityService.get_activity_by_id(db, act.id, viewer=host)

    @staticmethod
    async def cancel_activity(
        db: AsyncSession,
        activity_id: uuid.UUID,
        host: User,
    ) -> ActivityDetailResponse:
        stmt = select(Activity).where(Activity.id == activity_id)
        res = await db.execute(stmt)
        act = res.scalar_one_or_none()
        if not act:
            raise NotFoundException("Activity not found.")

        if act.host_id != host.id and not host.is_admin:
            raise ForbiddenException("Only the activity host can cancel this activity.")

        act.status = "CANCELLED"
        act.updated_at = datetime.now(timezone.utc)

        # Notify all confirmed participants
        from app.modules.notifications.service import NotificationService
        for p in act.participants:
            if p.user_id != host.id and p.status == "ACTIVE":
                await NotificationService.create_notification(
                    db,
                    user_id=p.user_id,
                    title="Outing Cancelled",
                    content=f"The outing '{act.title}' was cancelled by the host.",
                    notification_type="ACTIVITY_CANCELLED",
                    link_url=f"/activities/{act.id}",
                )

        await db.commit()

        return await ActivityService.get_activity_by_id(db, act.id, viewer=host)

    @staticmethod
    async def create_join_request(
        db: AsyncSession,
        activity_id: uuid.UUID,
        user: User,
        payload: JoinRequestCreate,
    ) -> JoinRequestResponse:
        stmt = (
            select(Activity)
            .options(
                joinedload(Activity.category),
                joinedload(Activity.host).joinedload(User.profile),
                selectinload(Activity.participants),
                selectinload(Activity.join_requests),
            )
            .where(Activity.id == activity_id)
        )
        res = await db.execute(stmt)
        act = res.scalar_one_or_none()
        if not act:
            raise NotFoundException("Activity not found.")

        if act.host_id == user.id:
            raise BadRequestException("You are the host of this activity and cannot request to join.")

        if act.status != "PUBLISHED":
            raise BadRequestException(f"Cannot join activity with status '{act.status}'.")

        # Check existing active participant
        if any(p.user_id == user.id and p.status == "ACTIVE" for p in act.participants):
            raise BadRequestException("You are already an active participant in this activity.")

        # Check existing pending request
        if any(r.user_id == user.id and r.status == "PENDING" for r in act.join_requests):
            raise ConflictException("You already have a pending join request for this activity.")

        # Check capacity
        active_count = len([p for p in act.participants if p.status == "ACTIVE"])
        if active_count >= act.max_participants:
            act.status = "FULL"
            await db.commit()
            raise BadRequestException("This activity has reached full capacity.")

        join_req = JoinRequest(
            activity_id=act.id,
            user_id=user.id,
            note=payload.note,
            status="PENDING",
        )
        db.add(join_req)
        await db.flush()

        # Send notification to the host
        from app.modules.notifications.service import NotificationService
        sender_name = user.profile.display_name if user.profile else user.email.split("@")[0]
        await NotificationService.create_notification(
            db,
            user_id=act.host_id,
            title="New Companion Request",
            content=f"{sender_name} requested to join your activity '{act.title}'.",
            notification_type="JOIN_REQUEST",
            link_url=f"/activities/{act.id}",
        )

        await db.commit()
        await db.refresh(join_req)

        # Load user profile and interests for response
        user_stmt = (
            select(User)
            .options(
                joinedload(User.profile),
                selectinload(User.user_interests).joinedload(UserInterest.interest),
            )
            .where(User.id == user.id)
        )
        user_res = await db.execute(user_stmt)
        full_user = user_res.scalar_one()

        return JoinRequestResponse(
            id=join_req.id,
            activity_id=act.id,
            activity_title=act.title,
            requester=_build_requester_summary(full_user),
            note=join_req.note,
            status=join_req.status,
            created_at=join_req.created_at,
            reviewed_at=join_req.reviewed_at,
        )

    @staticmethod
    async def list_activity_requests(
        db: AsyncSession,
        activity_id: uuid.UUID,
        host: User,
    ) -> List[JoinRequestResponse]:
        # Verify host
        act_stmt = select(Activity).where(Activity.id == activity_id)
        act_res = await db.execute(act_stmt)
        act = act_res.scalar_one_or_none()
        if not act:
            raise NotFoundException("Activity not found.")
        if act.host_id != host.id and not host.is_admin:
            raise ForbiddenException("Only the activity host can review join requests.")

        req_stmt = (
            select(JoinRequest)
            .options(
                joinedload(JoinRequest.user).joinedload(User.profile),
                joinedload(JoinRequest.user).selectinload(User.user_interests).joinedload(UserInterest.interest),
            )
            .where(JoinRequest.activity_id == activity_id)
            .order_by(desc(JoinRequest.created_at))
        )
        req_res = await db.execute(req_stmt)
        requests = req_res.scalars().all()

        return [
            JoinRequestResponse(
                id=r.id,
                activity_id=act.id,
                activity_title=act.title,
                requester=_build_requester_summary(r.user),
                note=r.note,
                status=r.status,
                created_at=r.created_at,
                reviewed_at=r.reviewed_at,
            )
            for r in requests
        ]

    @staticmethod
    async def handle_join_request_decision(
        db: AsyncSession,
        activity_id: uuid.UUID,
        request_id: uuid.UUID,
        host: User,
        decision: JoinRequestDecisionRequest,
    ) -> JoinRequestResponse:
        # 1. Fetch activity and verify host
        act_stmt = (
            select(Activity)
            .options(selectinload(Activity.participants))
            .where(Activity.id == activity_id)
        )
        act_res = await db.execute(act_stmt)
        act = act_res.scalar_one_or_none()
        if not act:
            raise NotFoundException("Activity not found.")
        if act.host_id != host.id and not host.is_admin:
            raise ForbiddenException("Only the activity host can accept or reject requests.")

        # 2. Fetch join request
        req_stmt = (
            select(JoinRequest)
            .options(
                joinedload(JoinRequest.user).joinedload(User.profile),
                joinedload(JoinRequest.user).selectinload(User.user_interests).joinedload(UserInterest.interest),
            )
            .where(JoinRequest.id == request_id, JoinRequest.activity_id == activity_id)
        )
        req_res = await db.execute(req_stmt)
        join_req = req_res.scalar_one_or_none()
        if not join_req:
            raise NotFoundException("Join request not found.")

        if join_req.status != "PENDING":
            raise BadRequestException(f"This join request has already been {join_req.status.lower()}.")

        now = datetime.now(timezone.utc)
        join_req.reviewed_by = host.id
        join_req.reviewed_at = now

        from app.modules.notifications.service import NotificationService
        from app.modules.messaging.service import MessagingService

        if decision.action == "ACCEPT":
            # Check capacity
            active_participants = [p for p in act.participants if p.status == "ACTIVE"]
            if len(active_participants) >= act.max_participants:
                act.status = "FULL"
                await db.commit()
                raise BadRequestException("Cannot accept request: activity is already at full capacity.")

            # Check if participant record exists (e.g. if previously left and re-joined)
            existing_part = next((p for p in act.participants if p.user_id == join_req.user_id), None)
            if existing_part:
                existing_part.status = "ACTIVE"
                existing_part.role = "MEMBER"
                existing_part.joined_at = now
            else:
                new_participant = ActivityParticipant(
                    activity_id=act.id,
                    user_id=join_req.user_id,
                    role="MEMBER",
                    status="ACTIVE",
                    joined_at=now,
                )
                db.add(new_participant)

            join_req.status = "ACCEPTED"

            # Check if now full
            if len(active_participants) + 1 >= act.max_participants:
                act.status = "FULL"

            # Add to group chat conversation
            conv = await MessagingService.get_or_create_activity_conversation(
                db, activity_id=act.id, title=act.title, host_id=host.id
            )
            await MessagingService.add_member_to_conversation(
                db, conversation_id=conv.id, user_id=join_req.user_id, role="MEMBER"
            )

            # Send notification to applicant
            host_name = host.profile.display_name if host.profile else "The host"
            await NotificationService.create_notification(
                db,
                user_id=join_req.user_id,
                title="Join Request Approved! 🎉",
                content=f"Your request to join '{act.title}' was approved by {host_name}! You are now admitted into the group chat.",
                notification_type="REQUEST_ACCEPTED",
                link_url=f"/activities/{act.id}",
            )
        else:
            join_req.status = "REJECTED"
            await NotificationService.create_notification(
                db,
                user_id=join_req.user_id,
                title="Request Update",
                content=f"Your request to join '{act.title}' was declined.",
                notification_type="REQUEST_REJECTED",
                link_url=f"/activities/{act.id}",
            )

        await db.commit()
        await db.refresh(join_req)

        return JoinRequestResponse(
            id=join_req.id,
            activity_id=act.id,
            activity_title=act.title,
            requester=_build_requester_summary(join_req.user),
            note=join_req.note,
            status=join_req.status,
            created_at=join_req.created_at,
            reviewed_at=join_req.reviewed_at,
        )

    @staticmethod
    async def leave_activity(
        db: AsyncSession,
        activity_id: uuid.UUID,
        user: User,
    ) -> None:
        act_stmt = (
            select(Activity)
            .options(selectinload(Activity.participants))
            .where(Activity.id == activity_id)
        )
        act_res = await db.execute(act_stmt)
        act = act_res.scalar_one_or_none()
        if not act:
            raise NotFoundException("Activity not found.")

        if act.host_id == user.id:
            raise BadRequestException("Hosts cannot leave their own activity. Please cancel the activity if you wish to withdraw.")

        part = next((p for p in act.participants if p.user_id == user.id and p.status == "ACTIVE"), None)
        if not part:
            raise BadRequestException("You are not an active participant in this activity.")

        part.status = "LEFT"
        # If activity was FULL, reopen it to PUBLISHED
        if act.status == "FULL":
            act.status = "PUBLISHED"

        await db.commit()

    @staticmethod
    async def get_my_activities_overview(
        db: AsyncSession,
        user: User,
    ) -> MyActivitiesOverviewResponse:
        # 1. Hosting
        host_stmt = (
            select(Activity)
            .options(
                joinedload(Activity.category),
                joinedload(Activity.host).joinedload(User.profile),
                selectinload(Activity.participants),
                selectinload(Activity.join_requests),
            )
            .where(Activity.host_id == user.id)
            .order_by(desc(Activity.created_at))
        )
        host_res = await db.execute(host_stmt)
        hosting_acts = host_res.unique().scalars().all()

        # 2. Joined (active participant where not host)
        joined_stmt = (
            select(Activity)
            .join(ActivityParticipant, ActivityParticipant.activity_id == Activity.id)
            .options(
                joinedload(Activity.category),
                joinedload(Activity.host).joinedload(User.profile),
                selectinload(Activity.participants),
                selectinload(Activity.join_requests),
            )
            .where(
                ActivityParticipant.user_id == user.id,
                ActivityParticipant.status == "ACTIVE",
                Activity.host_id != user.id,
            )
            .order_by(asc(Activity.start_time))
        )
        joined_res = await db.execute(joined_stmt)
        joined_acts = joined_res.unique().scalars().all()

        # 3. Pending requests submitted by user
        req_stmt = (
            select(JoinRequest)
            .join(Activity, Activity.id == JoinRequest.activity_id)
            .options(
                joinedload(JoinRequest.user).joinedload(User.profile),
                joinedload(JoinRequest.activity),
            )
            .where(JoinRequest.user_id == user.id, JoinRequest.status == "PENDING")
            .order_by(desc(JoinRequest.created_at))
        )
        req_res = await db.execute(req_stmt)
        pending_reqs = req_res.scalars().all()

        hosting_items = [_build_activity_summary(a, viewer=user) for a in hosting_acts]
        joined_items = [_build_activity_summary(a, viewer=user) for a in joined_acts]
        pending_items = [
            JoinRequestResponse(
                id=r.id,
                activity_id=r.activity_id,
                activity_title=r.activity.title if r.activity else None,
                requester=_build_requester_summary(r.user),
                note=r.note,
                status=r.status,
                created_at=r.created_at,
                reviewed_at=r.reviewed_at,
            )
            for r in pending_reqs
        ]

        return MyActivitiesOverviewResponse(
            hosting=hosting_items,
            joined=joined_items,
            pending_requests=pending_items,
        )

