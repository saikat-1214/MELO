import re
from typing import List, Set, Tuple
from app.core.config import settings
from app.shared.schemas import (
    UserVector,
    CandidateActivity,
    CandidateUser,
    ScoreBreakdown,
    ScoredEntity,
    RankingResponse,
)


def _tokenize_location(loc: str) -> Set[str]:
    """Tokenize location string into cleaned alphanumeric tokens."""
    if not loc:
        return set()
    cleaned = re.sub(r"[^\w\s]", " ", loc.lower())
    return {t.strip() for t in cleaned.split() if len(t.strip()) > 1}


class HeuristicScorer:
    """
    Transparent, deterministic explainable scoring engine.
    Computes grounded feature alignment scores and natural language explanations.
    """

    def __init__(self):
        self.w_interest = settings.WEIGHT_INTEREST
        self.w_schedule = settings.WEIGHT_SCHEDULE
        self.w_location = settings.WEIGHT_LOCATION
        self.w_category = settings.WEIGHT_CATEGORY
        self.min_threshold = settings.MIN_THRESHOLD_EXPLANATION
        self.version = settings.ALGORITHM_VERSION

    def compute_interest_overlap(
        self, user_interests: List[str], candidate_interests: List[str]
    ) -> Tuple[float, List[str]]:
        """Computes Jaccard similarity across interest tags and returns shared items."""
        if not user_interests or not candidate_interests:
            return 0.0, []

        user_set = {i.strip().lower() for i in user_interests if i}
        cand_set = {i.strip().lower() for i in candidate_interests if i}

        intersection = user_set.intersection(cand_set)
        union = user_set.union(cand_set)

        if not union:
            return 0.0, []

        score = len(intersection) / len(union)
        return round(score, 4), list(intersection)

    def compute_schedule_alignment(
        self, user_avail: list, cand_day: int, cand_slot: str
    ) -> Tuple[float, str]:
        """Calculates temporal alignment between candidate schedule and user availability."""
        if not user_avail:
            return 0.2, "No specific availability constraints specified"

        best_score = 0.0
        explanation = ""

        cand_slot_norm = cand_slot.strip().upper()

        for slot in user_avail:
            day = slot.day_of_week
            user_time = slot.time_slot.strip().upper()

            # Same day check
            if day is not None and day == cand_day:
                if user_time == cand_slot_norm:
                    return 1.0, f"Exact match for day {day} ({cand_slot})"
                elif user_time == "ALL_DAY":
                    if best_score < 0.8:
                        best_score = 0.8
                        explanation = f"Matches full-day availability on day {day}"
                else:
                    if best_score < 0.25:
                        best_score = 0.25
                        explanation = f"Available on same day ({day}), different time slot"
            elif day is None and user_time == cand_slot_norm:
                if best_score < 0.5:
                    best_score = 0.5
                    explanation = f"Matches preferred time slot ({cand_slot})"

        return best_score, explanation

    def compute_location_compatibility(
        self, user_loc: str, cand_loc: str
    ) -> Tuple[float, str]:
        """Calculates textual location overlap (locality, city tokens)."""
        u_tokens = _tokenize_location(user_loc)
        c_tokens = _tokenize_location(cand_loc)

        if not u_tokens or not c_tokens:
            return 0.3, "General regional area"

        shared = u_tokens.intersection(c_tokens)
        if not shared:
            return 0.1, ""

        score = len(shared) / max(len(u_tokens), len(c_tokens))
        return round(min(1.0, 0.4 + 0.6 * score), 4), f"Near {', '.join(shared).title()}"

    def score_activity(
        self, user: UserVector, cand: CandidateActivity
    ) -> ScoredEntity:
        """Scores an individual activity candidate against the user vector."""
        interest_score, shared_interests = self.compute_interest_overlap(
            user.interests, cand.interests
        )
        schedule_score, sched_expl = self.compute_schedule_alignment(
            user.availability, cand.day_of_week, cand.time_slot
        )
        loc_score, loc_expl = self.compute_location_compatibility(
            user.general_location, cand.general_location
        )

        # Category score
        category_score = 0.2
        cand_cat_norm = cand.category.strip().lower()
        if any(cat.lower() in cand_cat_norm for cat in user.category_preferences):
            category_score = 1.0

        # Weighted aggregate
        total_score = (
            self.w_interest * interest_score
            + self.w_schedule * schedule_score
            + self.w_location * loc_score
            + self.w_category * category_score
        )
        total_score = round(min(1.0, max(0.0, total_score)), 4)

        # Build grounded explanations
        explanations = []
        if shared_interests:
            explanations.append(f"Shares interests: {', '.join(i.title() for i in shared_interests[:3])}")
        if schedule_score >= 0.7 and sched_expl:
            explanations.append(sched_expl)
        if loc_score >= 0.6 and loc_expl:
            explanations.append(loc_expl)
        if category_score >= 0.8:
            explanations.append(f"In your preferred category: {cand.category}")

        if not explanations:
            explanations.append("Recommended based on current community activity")

        return ScoredEntity(
            entity_id=cand.activity_id,
            score=total_score,
            breakdown=ScoreBreakdown(
                interest_score=interest_score,
                schedule_score=schedule_score,
                location_score=loc_score,
                category_score=category_score,
            ),
            explanations=explanations,
        )

    def rank_activities(
        self, user: UserVector, candidates: List[CandidateActivity], limit: int = 20
    ) -> RankingResponse:
        """Ranks multiple candidate activities deterministically."""
        scored = [self.score_activity(user, cand) for cand in candidates]
        scored.sort(key=lambda x: x.score, reverse=True)
        return RankingResponse(
            algorithm_version=self.version,
            total_candidates=len(candidates),
            ranked_results=scored[:limit],
        )

    def score_peer(self, user: UserVector, cand: CandidateUser) -> ScoredEntity:
        """Scores a prospective peer against the user vector."""
        interest_score, shared_interests = self.compute_interest_overlap(
            user.interests, cand.interests
        )
        loc_score, loc_expl = self.compute_location_compatibility(
            user.general_location, cand.general_location
        )

        # Peer schedule overlap
        best_sched_score = 0.0
        sched_matches = 0
        for u_slot in user.availability:
            for c_slot in cand.availability:
                if u_slot.day_of_week == c_slot.day_of_week and (
                    u_slot.time_slot == c_slot.time_slot or u_slot.time_slot == "ALL_DAY" or c_slot.time_slot == "ALL_DAY"
                ):
                    sched_matches += 1
        if sched_matches > 0:
            best_sched_score = min(1.0, 0.4 + 0.3 * sched_matches)

        # Peer weights: 0.5 interest, 0.3 schedule, 0.2 location
        total_score = 0.50 * interest_score + 0.30 * best_sched_score + 0.20 * loc_score
        total_score = round(min(1.0, max(0.0, total_score)), 4)

        explanations = []
        if shared_interests:
            explanations.append(f"Common interests: {', '.join(i.title() for i in shared_interests[:3])}")
        if sched_matches > 0:
            explanations.append(f"Overlapping free time on {sched_matches} day(s)")
        if loc_score >= 0.6 and loc_expl:
            explanations.append(loc_expl)

        if not explanations:
            explanations.append("Community member in your general region")

        return ScoredEntity(
            entity_id=cand.user_id,
            score=total_score,
            breakdown=ScoreBreakdown(
                interest_score=interest_score,
                schedule_score=best_sched_score,
                location_score=loc_score,
                category_score=0.0,
            ),
            explanations=explanations,
        )

    def rank_peers(
        self, user: UserVector, candidates: List[CandidateUser], limit: int = 20
    ) -> RankingResponse:
        """Ranks prospective peer users deterministically."""
        scored = [self.score_peer(user, cand) for cand in candidates]
        scored.sort(key=lambda x: x.score, reverse=True)
        return RankingResponse(
            algorithm_version=self.version,
            total_candidates=len(candidates),
            ranked_results=scored[:limit],
        )


scorer = HeuristicScorer()

