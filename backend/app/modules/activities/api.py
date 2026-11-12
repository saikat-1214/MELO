import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user, get_optional_current_user
from app.modules.users.models import User
from app.modules.activities.schemas import (
    ActivityCreateRequest,
    ActivityUpdateRequest,
    ActivityDetailResponse,
    ActivityListResponse,
    JoinRequestCreate,
    JoinRequestResponse,
    JoinRequestDecisionRequest,
    MyActivitiesOverviewResponse,
)
from app.modules.activities.service import ActivityService

router = APIRouter(prefix="/activities", tags=["Activities & Meetups"])


@router.post("", response_model=ActivityDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(
    payload: ActivityCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new public real-world activity meetup.
    The host is automatically registered as the first confirmed participant.
    """
    return await ActivityService.create_activity(db, host=current_user, payload=payload)


@router.get("", response_model=ActivityListResponse)
async def list_activities(
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by activity category UUID"),
    city: Optional[str] = Query(None, description="Filter by city name"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    status: Optional[str] = Query("PUBLISHED", description="Filter by status (default PUBLISHED)"),
    date_from: Optional[datetime] = Query(None, description="Filter activities starting on or after"),
    date_to: Optional[datetime] = Query(None, description="Filter activities starting on or before"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=50, description="Items per page"),
    viewer: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Browse and discover upcoming public activities with multi-attribute filtering.
    """
    return await ActivityService.list_activities(
        db=db,
        category_id=category_id,
        city=city,
        search=search,
        status=status,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
        viewer=viewer,
    )


@router.get("/my/overview", response_model=MyActivitiesOverviewResponse)
async def get_my_activities_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get consolidated activities for the logged-in user:
    - Activities hosted
    - Activities joined as confirmed participant
    - Pending join requests submitted
    """
    return await ActivityService.get_my_activities_overview(db, user=current_user)


@router.get("/{activity_id}", response_model=ActivityDetailResponse)
async def get_activity(
    activity_id: uuid.UUID,
    viewer: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve full activity details including host, public landmark, confirmed participant roster, and viewer status.
    """
    return await ActivityService.get_activity_by_id(db, activity_id=activity_id, viewer=viewer)


@router.put("/{activity_id}", response_model=ActivityDetailResponse)
async def update_activity(
    activity_id: uuid.UUID,
    payload: ActivityUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update activity details. Restricted to the activity host.
    """
    return await ActivityService.update_activity(db, activity_id=activity_id, host=current_user, payload=payload)


@router.post("/{activity_id}/cancel", response_model=ActivityDetailResponse)
async def cancel_activity(
    activity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cancel an activity. Restricted to the activity host.
    """
    return await ActivityService.cancel_activity(db, activity_id=activity_id, host=current_user)


@router.post("/{activity_id}/requests", response_model=JoinRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_join_request(
    activity_id: uuid.UUID,
    payload: JoinRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a request to participate in an activity with an optional note to the host.
    """
    return await ActivityService.create_join_request(db, activity_id=activity_id, user=current_user, payload=payload)


@router.get("/{activity_id}/requests", response_model=List[JoinRequestResponse])
async def list_activity_requests(
    activity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all join requests for an activity. Restricted to the activity host.
    """
    return await ActivityService.list_activity_requests(db, activity_id=activity_id, host=current_user)


@router.post("/{activity_id}/requests/{request_id}/decision", response_model=JoinRequestResponse)
async def handle_join_request_decision(
    activity_id: uuid.UUID,
    request_id: uuid.UUID,
    payload: JoinRequestDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Host accepts or rejects a pending join request.
    On acceptance, the requester becomes an active participant.
    If capacity is reached, the activity is automatically marked as FULL.
    """
    return await ActivityService.handle_join_request_decision(
        db,
        activity_id=activity_id,
        request_id=request_id,
        host=current_user,
        decision=payload,
    )


@router.post("/{activity_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_activity(
    activity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Leave an activity you previously joined.
    Hosts cannot leave; they must cancel the activity instead.
    """
    await ActivityService.leave_activity(db, activity_id=activity_id, user=current_user)

