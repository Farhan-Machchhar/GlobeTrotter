"""
Itinerary builder endpoints for GlobeTrotter.
POST   /api/itinerary/{trip_id}/days          — Create an itinerary day (maps to Stop)
GET    /api/itinerary/{trip_id}/days          — Get all days with activities
POST   /api/itinerary/{day_id}/activities     — Add activity to a day
DELETE /api/itinerary/activities/{activity_id} — Remove activity from day
POST   /api/itinerary/reorder                 — Reorder activities (drag-and-drop)
"""
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models import Activity, Stop, Trip
from app.schemas.trip import (
    ActivityResponse, ItineraryDayCreate, ActivityAddToDay,
    ReorderItineraryRequest, StopResponse,
)

logger = logging.getLogger("globetrotter.itinerary")
router = APIRouter(prefix="/itinerary", tags=["Itinerary"])


@router.post("/{trip_id}/days", response_model=StopResponse, status_code=status.HTTP_201_CREATED)
async def create_itinerary_day(
    trip_id: str,
    day_in: ItineraryDayCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create an itinerary day for a trip.

    Each day maps to a Stop. city_id (slug) can be used to look up lat/lng.
    """
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Trip not found.")

    # Resolve city info from city_id slug if provided
    from app.api.cities import _CITY_MAP
    city_name = day_in.city_name or "Unknown City"
    country = day_in.country
    latitude = day_in.latitude
    longitude = day_in.longitude

    if day_in.city_id and day_in.city_id in _CITY_MAP:
        city = _CITY_MAP[day_in.city_id]
        city_name = city_name or city.name
        country = country or city.country
        latitude = latitude or city.latitude
        longitude = longitude or city.longitude

    # Count existing stops to set order
    count_result = await db.execute(
        select(Stop).where(Stop.trip_id == trip_id)
    )
    order_index = len(count_result.scalars().all())

    stop = Stop(
        trip_id=trip_id,
        city_name=city_name,
        country=country,
        latitude=latitude,
        longitude=longitude,
        day_date=day_in.day_date,
        notes=day_in.notes,
        order_index=order_index,
    )
    db.add(stop)
    await db.commit()

    result = await db.execute(
        select(Stop).options(selectinload(Stop.activities)).where(Stop.id == stop.id)
    )
    return result.scalars().first()


@router.get("/{trip_id}/days", response_model=List[StopResponse])
async def get_itinerary_days(trip_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all itinerary days for a trip, ordered by index.

    Each day (Stop) includes its planned activities.
    """
    result = await db.execute(
        select(Stop)
        .options(selectinload(Stop.activities))
        .where(Stop.trip_id == trip_id)
        .order_by(Stop.order_index)
    )
    return result.scalars().all()


@router.post("/{day_id}/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def add_activity_to_day(
    day_id: str,
    act_in: ActivityAddToDay,
    db: AsyncSession = Depends(get_db),
):
    """
    Add an activity to an itinerary day.

    Either reference an existing activity by activity_id,
    or provide inline activity fields to create a new one.
    """
    result = await db.execute(select(Stop).where(Stop.id == day_id))
    stop = result.scalars().first()
    if not stop:
        raise HTTPException(status_code=404, detail="Itinerary day not found.")

    # Count existing activities for order_index
    acts_result = await db.execute(select(Activity).where(Activity.stop_id == day_id))
    next_order = len(acts_result.scalars().all())

    # If referencing an existing Activity, clone its data into this stop
    source_title = act_in.title or "Activity"
    source_desc = act_in.description
    source_cat = act_in.category
    source_cost = act_in.cost
    source_dur = act_in.duration_mins
    source_lat = act_in.latitude
    source_lng = act_in.longitude

    if act_in.activity_id:
        src_result = await db.execute(select(Activity).where(Activity.id == act_in.activity_id))
        src = src_result.scalars().first()
        if src:
            source_title = src.title
            source_desc = src.description
            source_cat = src.category
            source_cost = src.cost
            source_dur = src.duration_mins
            source_lat = src.latitude
            source_lng = src.longitude

    activity = Activity(
        stop_id=day_id,
        title=source_title,
        name=source_title,
        description=source_desc,
        category=source_cat,
        activity_type=source_cat,
        cost=source_cost,
        duration_mins=source_dur,
        day_number=stop.order_index + 1,
        order_index=act_in.order_index if act_in.order_index else next_order,
        start_time=act_in.start_time,
        end_time=act_in.end_time,
        latitude=source_lat,
        longitude=source_lng,
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_activity_from_day(activity_id: str, db: AsyncSession = Depends(get_db)):
    """Remove a planned activity from an itinerary day."""
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    act = result.scalars().first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found.")
    await db.delete(act)
    await db.commit()
    return None


@router.post("/reorder", status_code=status.HTTP_200_OK)
async def reorder_itinerary_activities(
    req: ReorderItineraryRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Reorder activities within a stop (drag-and-drop support).

    Accepts a list of {id, order_index, day_number} and updates all in one commit.
    """
    result = await db.execute(select(Stop).where(Stop.id == req.stop_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Stop not found.")

    updated = 0
    for item in req.activities:
        act_result = await db.execute(
            select(Activity).where(Activity.id == item.id, Activity.stop_id == req.stop_id)
        )
        act = act_result.scalars().first()
        if act:
            act.order_index = item.order_index
            if item.day_number is not None:
                act.day_number = item.day_number
            updated += 1

    await db.commit()
    return {"message": "Itinerary reordered successfully.", "updated_count": updated}
