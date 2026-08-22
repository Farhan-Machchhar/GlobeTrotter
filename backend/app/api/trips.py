"""
Trip CRUD endpoints for GlobeTrotter.
POST   /api/trips           — Create trip
GET    /api/trips           — List user's trips
GET    /api/trips/{id}      — Get trip details
PATCH  /api/trips/{id}      — Update trip
DELETE /api/trips/{id}      — Delete trip
"""
import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user, get_current_user_optional
from app.database.session import get_db
from app.models import Activity, Stop, Trip, User
from app.schemas.trip import TripCreate, TripResponse, TripUpdate

logger = logging.getLogger("globetrotter.trips")
router = APIRouter(prefix="/trips", tags=["Trips"])


def _load_trip_query(trip_id: Optional[str] = None):
    """Return a select query that eagerly loads stops → activities and expenses."""
    q = select(Trip).options(
        selectinload(Trip.stops).selectinload(Stop.activities),
        selectinload(Trip.expenses),
    )
    if trip_id:
        q = q.where(Trip.id == trip_id)
    return q


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_in: TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Create a new trip.

    Requires authentication for ownership tracking.
    Allows anonymous creation for the hackathon demo.
    """
    share_slug = str(uuid.uuid4())[:8]
    cover = trip_in.cover_photo_url or trip_in.cover_image_url or \
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200"

    trip = Trip(
        user_id=current_user.id if current_user else None,
        name=trip_in.name,
        title=trip_in.name,
        description=trip_in.description,
        destination=trip_in.destination,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        duration_days=trip_in.duration_days,
        budget=trip_in.budget or 0.0,
        total_budget=trip_in.budget or 0.0,
        currency=trip_in.currency,
        cover_photo_url=cover,
        cover_image_url=cover,
        status="planning",
        is_public=trip_in.is_public,
        share_slug=share_slug,
    )
    db.add(trip)
    await db.flush()

    for idx, stop_in in enumerate(trip_in.stops or []):
        stop = Stop(
            trip_id=trip.id,
            city_name=stop_in.city_name,
            country=stop_in.country,
            latitude=stop_in.latitude,
            longitude=stop_in.longitude,
            arrival_date=stop_in.arrival_date,
            departure_date=stop_in.departure_date,
            notes=stop_in.notes,
            order_index=idx,
        )
        db.add(stop)

    await db.commit()
    result = await db.execute(_load_trip_query(trip.id))
    return result.scalars().first()


@router.get("", response_model=List[TripResponse])
async def list_trips(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """
    List trips.

    - If authenticated: returns only the current user's trips.
    - If anonymous: returns all public trips (hackathon demo mode).
    """
    q = _load_trip_query().order_by(Trip.created_at.desc()).offset(skip).limit(limit)
    if current_user:
        q = q.where(Trip.user_id == current_user.id)
    else:
        q = q.where(Trip.is_public == True)

    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str, db: AsyncSession = Depends(get_db)):
    """Get full trip details including stops, activities, and expenses."""
    result = await db.execute(_load_trip_query(trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return trip


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    update_in: TripUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Update trip fields.

    Only the trip creator can update. Anonymous updates allowed for demo mode.
    """
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    # Ownership check — only enforce if both token and owner are present
    if current_user and trip.user_id and trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this trip.")

    update_data = update_in.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(trip, field, value)

    # Keep alias fields in sync
    if "name" in update_data:
        trip.title = trip.name
    if "budget" in update_data:
        trip.total_budget = trip.budget
    if "cover_photo_url" in update_data:
        trip.cover_image_url = trip.cover_photo_url

    await db.commit()
    result = await db.execute(_load_trip_query(trip_id))
    logger.info(f"Trip {trip_id} updated.")
    return result.scalars().first()


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Delete a trip and all its stops, activities, expenses, and shares."""
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    if current_user and trip.user_id and trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this trip.")

    await db.delete(trip)
    await db.commit()
    logger.info(f"Trip {trip_id} deleted.")
    return None
