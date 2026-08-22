"""
Trip stop (city) endpoints for GlobeTrotter.
POST   /api/trips/{trip_id}/stops   — Add city to trip
GET    /api/stops/{stop_id}         — Get stop details
DELETE /api/stops/{stop_id}         — Remove city from trip
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models import Stop, Trip
from app.schemas.trip import StopCreate, StopResponse

logger = logging.getLogger("globetrotter.stops")
router = APIRouter(tags=["Stops"])


@router.post("/trips/{trip_id}/stops", response_model=StopResponse, status_code=status.HTTP_201_CREATED)
async def add_stop_to_trip(
    trip_id: str,
    stop_in: StopCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Add a new city stop to an existing trip.

    Auto-increments order_index.
    """
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Trip not found.")

    max_q = await db.execute(
        select(func.coalesce(func.max(Stop.order_index), -1)).where(Stop.trip_id == trip_id)
    )
    next_order = max_q.scalar() + 1

    stop = Stop(
        trip_id=trip_id,
        city_name=stop_in.city_name,
        country=stop_in.country,
        latitude=stop_in.latitude,
        longitude=stop_in.longitude,
        arrival_date=stop_in.arrival_date,
        departure_date=stop_in.departure_date,
        day_date=stop_in.day_date,
        notes=stop_in.notes,
        order_index=next_order,
    )
    db.add(stop)
    await db.commit()

    result = await db.execute(
        select(Stop).options(selectinload(Stop.activities)).where(Stop.id == stop.id)
    )
    return result.scalars().first()


@router.get("/stops/{stop_id}", response_model=StopResponse)
async def get_stop(stop_id: str, db: AsyncSession = Depends(get_db)):
    """Get a stop and all its planned activities."""
    result = await db.execute(
        select(Stop).options(selectinload(Stop.activities)).where(Stop.id == stop_id)
    )
    stop = result.scalars().first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found.")
    return stop


@router.delete("/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stop(stop_id: str, db: AsyncSession = Depends(get_db)):
    """Remove a city stop (and its activities) from a trip."""
    result = await db.execute(select(Stop).where(Stop.id == stop_id))
    stop = result.scalars().first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found.")
    await db.delete(stop)
    await db.commit()
    return None
