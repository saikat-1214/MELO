import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select, and_, not_
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User, UserProfile, UserAvailability
from app.modules.interests.models import UserInterest, Interest, ActivityCategory
from app.modules.activities.models import Activity, ActivityParticipant
from app.modules.activities.service import _build_activity_summary
from app.modules.matching.schemas import (
    RecommendationBreakdown,
    ActivityRecommendationItem,
    ActivityRecommendationsResponse,
    PeerRecommendationItem,
    PeerRecommendationsResponse,
)
from app.modules.matching.client import AIServiceClient
from app.modules.safety.service import SafetyService


def _get_time_slot_from_hour(hour: int) -> str:
    if 5 <= hour < 12:
        return "MORNING"
    elif 12 <= hour < 17:
        return "AFTERNOON"
    elif 17 <= hour < 21:
        return "EVENING"
    else:
        return "NIGHT"


class MatchingService:
    @staticmethod
    async def get_recommended_activities(
        db: AsyncSession,
        user: User,
        limit: int = 12,
    ) -> ActivityRecommendationsResponse:
        # 1. Fetch user interests and availability
        user_stmt = (
            select(User)
            .options(
                joinedload(User.profile),
                selectinload(User.user_interests).joinedload(UserInterest.interest),
                selectinload(User.availability),
            )
            .where(User.id == user.id)
        )
        user_res = await db.execute(user_stmt)
        full_user = user_res.scalar_one()

        user_interests = [ui.interest.name for ui in full_user.user_interests if ui.interest]
        interest_proficiencies = {
            ui.interest.name: ui.proficiency_level for ui in full_user.user_interests if ui.interest
        }
        user_loc = full_user.profile.general_location if full_user.profile else ""
        user_avail = [
            {"day_of_week": a.day_of_week, "time_slot": a.time_slot}
            for a in full_user.availability
        ]

        # 2. Get blocked user IDs
        blocked_ids = await SafetyService.get_bidirectional_blocked_user_ids(db, user.id)

        # 3. Fetch candidate activities
        conditions = [
            Activity.status == "PUBLISHED",
            Activity.host_id != user.id,
        ]
        if blocked_ids:
            conditions.append(Activity.host_id.not_in(list(blocked_ids)))

        act_stmt = (
            select(Activity)
            .options(
                joinedload(Activity.category),
                joinedload(Activity.host).joinedload(User.profile),
                selectinload(Activity.participants),
                selectinload(Activity.join_requests),
            )
            .where(and_(*conditions))
            .limit(50)
        )
        act_res = await db.execute(act_stmt)
        candidates_db = act_res.unique().scalars().all()

        if not candidates_db:
            return ActivityRecommendationsResponse(algorithm_version="v1.0-deterministic", items=[])

        # 4. Format payload for AI Service
        ai_candidates = []
        activity_map: Dict[str, Activity] = {}

        for act in candidates_db:
            act_id_str = str(act.id)
            activity_map[act_id_str] = act
            active_count = len([p for p in act.participants if p.status == "ACTIVE"])
            spots_left = max(0, act.max_participants - active_count)
            # Python weekday(): 0=Mon, 6=Sun -> convert to 0=Sun, 6=Sat
            dow = (act.start_time.weekday() + 1) % 7
            slot = _get_time_slot_from_hour(act.start_time.hour)

            ai_candidates.append({
                "activity_id": act_id_str,
                "category": act.category.name if act.category else "General",
                "category_slug": act.category.slug if act.category else "general",
                "interests": [act.category.name] if act.category else [],
                "general_location": act.city,
                "day_of_week": dow,
                "time_slot": slot,
                "capacity": act.max_participants,
                "available_spots": spots_left,
            })

        user_vector = {
            "user_id": str(user.id),
            "interests": user_interests,
            "interest_proficiencies": interest_proficiencies,
            "general_location": user_loc,
            "availability": user_avail,
            "category_preferences": user_interests,
        }

        payload = {
            "user": user_vector,
            "candidates": ai_candidates,
            "limit": limit,
        }

        # 5. Call AI microservice
        ai_response = await AIServiceClient.match_activities(payload)
        items: List[ActivityRecommendationItem] = []

        if ai_response and "ranked_results" in ai_response:
            for item in ai_response["ranked_results"]:
                eid = item["entity_id"]
                if eid in activity_map:
                    act = activity_map[eid]
                    summary = _build_activity_summary(act, viewer=user)
                    score = float(item["score"])
                    items.append(
                        ActivityRecommendationItem(
                            activity=summary,
                            match_score=score,
                            match_percentage=int(score * 100),
                            breakdown=RecommendationBreakdown(**item["breakdown"]),
                            explanations=item.get("explanations", []),
                        )
                    )
            return ActivityRecommendationsResponse(
                algorithm_version=ai_response.get("algorithm_version", "v1.0-deterministic"),
                items=items,
            )

        # 6. Fallback heuristic ranking (circuit breaker)
        for act in candidates_db[:limit]:
            summary = _build_activity_summary(act, viewer=user)
            # Simple fallback heuristic score
            loc_match = 1.0 if user_loc.lower() in act.city.lower() or act.city.lower() in user_loc.lower() else 0.3
            cat_match = 0.8
            interest_match = 0.7
            score = round(0.4 * interest_match + 0.3 * 0.5 + 0.2 * loc_match + 0.1 * cat_match, 2)

            items.append(
                ActivityRecommendationItem(
                    activity=summary,
                    match_score=score,
                    match_percentage=int(score * 100),
                    breakdown=RecommendationBreakdown(
                        interest_score=interest_match,
                        schedule_score=0.5,
                        location_score=loc_match,
                        category_score=cat_match,
                    ),
                    explanations=[
                        f"Active in your preferred city: {act.city}",
                        f"Matches {act.category.name if act.category else 'community'} activities",
                    ],
                )
            )

        return ActivityRecommendationsResponse(
            algorithm_version="v1.0-fallback",
            items=items,
        )

    @staticmethod
    async def get_recommended_peers(
        db: AsyncSession,
        user: User,
        limit: int = 10,
    ) -> PeerRecommendationsResponse:
        # Fetch current user
        user_stmt = (
            select(User)
            .options(
                joinedload(User.profile),
                selectinload(User.user_interests).joinedload(UserInterest.interest),
                selectinload(User.availability),
            )
            .where(User.id == user.id)
        )
        user_res = await db.execute(user_stmt)
        full_user = user_res.scalar_one()

        user_interests = [ui.interest.name for ui in full_user.user_interests if ui.interest]
        interest_proficiencies = {
            ui.interest.name: ui.proficiency_level for ui in full_user.user_interests if ui.interest
        }
        user_loc = full_user.profile.general_location if full_user.profile else ""
        user_avail = [
            {"day_of_week": a.day_of_week, "time_slot": a.time_slot}
            for a in full_user.availability
        ]

        # Get blocked IDs
        blocked_ids = await SafetyService.get_bidirectional_blocked_user_ids(db, user.id)

        # Fetch other candidate users
        peer_conditions = [
            User.id != user.id,
            User.is_active == True,
        ]
        if blocked_ids:
            peer_conditions.append(User.id.not_in(list(blocked_ids)))

        peer_stmt = (
            select(User)
            .join(UserProfile, UserProfile.user_id == User.id)
            .options(
                joinedload(User.profile),
                selectinload(User.user_interests).joinedload(UserInterest.interest),
                selectinload(User.availability),
            )
            .where(and_(*peer_conditions))
            .limit(30)
        )
        peer_res = await db.execute(peer_stmt)
        candidates = peer_res.unique().scalars().all()

        if not candidates:
            return PeerRecommendationsResponse(algorithm_version="v1.0-deterministic", items=[])

        user_map: Dict[str, User] = {}
        ai_candidates = []
        for c in candidates:
            cid = str(c.id)
            user_map[cid] = c
            c_interests = [ui.interest.name for ui in c.user_interests if ui.interest]
            c_avail = [{"day_of_week": a.day_of_week, "time_slot": a.time_slot} for a in c.availability]
            ai_candidates.append({
                "user_id": cid,
                "interests": c_interests,
                "general_location": c.profile.general_location if c.profile else "",
                "availability": c_avail,
            })

        payload = {
            "user": {
                "user_id": str(user.id),
                "interests": user_interests,
                "interest_proficiencies": interest_proficiencies,
                "general_location": user_loc,
                "availability": user_avail,
                "category_preferences": user_interests,
            },
            "candidates": ai_candidates,
            "limit": limit,
        }

        ai_res = await AIServiceClient.match_users(payload)
        items: List[PeerRecommendationItem] = []

        if ai_res and "ranked_results" in ai_res:
            for item in ai_res["ranked_results"]:
                uid = item["entity_id"]
                if uid in user_map:
                    peer = user_map[uid]
                    profile = peer.profile
                    peer_interests = [ui.interest.name for ui in peer.user_interests if ui.interest]
                    shared = list(set(user_interests).intersection(set(peer_interests)))
                    score = float(item["score"])
                    items.append(
                        PeerRecommendationItem(
                            user_id=peer.id,
                            display_name=profile.display_name if profile else peer.email.split("@")[0],
                            avatar_url=profile.avatar_url if profile else None,
                            general_location=profile.general_location if profile else "",
                            age=profile.age if profile else None,
                            bio=profile.bio if profile else None,
                            shared_interests=shared,
                            match_score=score,
                            match_percentage=int(score * 100),
                            breakdown=RecommendationBreakdown(**item["breakdown"]),
                            explanations=item.get("explanations", []),
                        )
                    )
            return PeerRecommendationsResponse(
                algorithm_version=ai_res.get("algorithm_version", "v1.0-deterministic"),
                items=items,
            )

        # Fallback
        for peer in candidates[:limit]:
            profile = peer.profile
            peer_interests = [ui.interest.name for ui in peer.user_interests if ui.interest]
            shared = list(set(user_interests).intersection(set(peer_interests)))
            items.append(
                PeerRecommendationItem(
                    user_id=peer.id,
                    display_name=profile.display_name if profile else peer.email.split("@")[0],
                    avatar_url=profile.avatar_url if profile else None,
                    general_location=profile.general_location if profile else "",
                    age=profile.age if profile else None,
                    bio=profile.bio if profile else None,
                    shared_interests=shared,
                    match_score=0.75,
                    match_percentage=75,
                    breakdown=RecommendationBreakdown(
                        interest_score=0.7,
                        schedule_score=0.8,
                        location_score=0.8,
                        category_score=0.7,
                    ),
                    explanations=[
                        f"Common interests in {', '.join(shared) if shared else 'community activities'}",
                        f"Both in {profile.general_location if profile else 'same region'}",
                    ],
                )
            )

        return PeerRecommendationsResponse(
            algorithm_version="v1.0-fallback",
            items=items,
        )

