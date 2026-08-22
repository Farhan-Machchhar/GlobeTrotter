"""
Trip sharing endpoints for GlobeTrotter.
POST   /api/sharing/{trip_id}/share   — Create public share link (auth required)
GET    /api/sharing/{slug}            — Get public trip view (no auth)
DELETE /api/sharing/{trip_id}/share   — Revoke public access (auth required)
"""
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models import Share, Stop, Trip, User
from app.schemas.trip import PublicTripResponse, ShareResponse, StopResponse

logger = logging.getLogger("globetrotter.sharing")
router = APIRouter(prefix="/sharing", tags=["Sharing"])


def _build_share_url(request: Request, slug: str) -> str:
    """Build the full public share URL."""
    base = str(request.base_url).rstrip("/")
    return f"{base}/api/sharing/{slug}"


@router.post("/{trip_id}/share", response_model=ShareResponse, status_code=status.HTTP_201_CREATED)
async def create_share_link(
    trip_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create (or return existing) public share link for a trip.

    Marks the trip as is_public=True and generates a unique slug.
    """
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    if trip.user_id and trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't own this trip.")

    # Return existing active share if one exists
    existing = await db.execute(
        select(Share).where(Share.trip_id == trip_id, Share.is_active == True)
    )
    share = existing.scalars().first()
    if share:
        return ShareResponse(
            id=share.id,
            trip_id=trip_id,
            slug=share.slug,
            share_url=_build_share_url(request, share.slug),
            is_active=share.is_active,
            created_at=share.created_at,
        )

    # Generate slug: "{trip-name-slug}-{short-uuid}"
    name_part = (trip.name or "trip").lower().replace(" ", "-")[:20]
    slug = f"{name_part}-{str(uuid.uuid4())[:6]}"

    share = Share(trip_id=trip_id, user_id=current_user.id, slug=slug, is_active=True)
    db.add(share)

    # Mark trip as public
    trip.is_public = True
    trip.share_slug = slug

    await db.commit()
    await db.refresh(share)

    logger.info(f"Share link created for trip {trip_id}: {slug}")
    return ShareResponse(
        id=share.id,
        trip_id=trip_id,
        slug=slug,
        share_url=_build_share_url(request, slug),
        is_active=True,
        created_at=share.created_at,
    )


@router.get("/{slug}", response_model=PublicTripResponse)
async def get_public_trip(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Get a publicly shared trip by its slug.

    No authentication required. Returns trip details, stops, and activities.
    """
    # Check shares table first (new model)
    share_result = await db.execute(
        select(Share).where(Share.slug == slug, Share.is_active == True)
    )
    share = share_result.scalars().first()

    if share:
        result = await db.execute(
            select(Trip)
            .options(selectinload(Trip.stops).selectinload(Stop.activities))
            .where(Trip.id == share.trip_id)
        )
    else:
        # Fallback: check trip.share_slug (legacy)
        result = await db.execute(
            select(Trip)
            .options(selectinload(Trip.stops).selectinload(Stop.activities))
            .where(Trip.share_slug == slug, Trip.is_public == True)
        )

    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found or access has been revoked.")

    # Fetch creator username
    creator_name = None
    if trip.user_id:
        from app.models import User as UserModel
        user_result = await db.execute(
            select(UserModel).where(UserModel.id == trip.user_id)
        )
        user = user_result.scalars().first()
        creator_name = user.username or user.full_name or user.email if user else None

    return PublicTripResponse(
        trip_id=trip.id,
        name=trip.name or trip.title or "Untitled Trip",
        description=trip.description,
        start_date=trip.start_date,
        end_date=trip.end_date,
        destination=trip.destination,
        creator=creator_name,
        slug=slug,
        cover_photo_url=trip.cover_photo_url or trip.cover_image_url,
        stops=[StopResponse.model_validate(s) for s in trip.stops],
    )


@router.delete("/{trip_id}/share", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_share_link(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Revoke the public share link for a trip.

    Marks all active shares as inactive and sets trip.is_public = False.
    """
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    if trip.user_id and trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't own this trip.")

    # Deactivate all shares for this trip
    shares_result = await db.execute(
        select(Share).where(Share.trip_id == trip_id, Share.is_active == True)
    )
    for share in shares_result.scalars().all():
        share.is_active = False

    trip.is_public = False
    await db.commit()

    logger.info(f"Share link revoked for trip {trip_id}")
    return None
