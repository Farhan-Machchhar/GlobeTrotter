import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models import Trip, Stop, Activity
from app.schemas.trip import TripCreate, TripResponse

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(trip_in: TripCreate, db: AsyncSession = Depends(get_db)):
    share_slug = str(uuid.uuid4())[:8]
    trip = Trip(
        title=trip_in.title,
        description=trip_in.description,
        destination=trip_in.destination,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        duration_days=trip_in.duration_days,
        total_budget=trip_in.total_budget,
        currency=trip_in.currency,
        cover_image_url=trip_in.cover_image_url or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200",
        is_public=trip_in.is_public,
        share_slug=share_slug
    )
    db.add(trip)
    await db.flush()

    if trip_in.stops:
        for idx, stop_in in enumerate(trip_in.stops):
            stop = Stop(
                trip_id=trip.id,
                city_name=stop_in.city_name,
                country=stop_in.country,
                latitude=stop_in.latitude,
                longitude=stop_in.longitude,
                arrival_date=stop_in.arrival_date,
                departure_date=stop_in.departure_date,
                order_index=idx
            )
            db.add(stop)

    await db.commit()

    # Re-fetch with relationships loaded
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities), selectinload(Trip.expenses))
        .where(Trip.id == trip.id)
    )
    return result.scalars().first()


@router.get("", response_model=List[TripResponse])
async def list_trips(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities), selectinload(Trip.expenses))
        .order_by(Trip.created_at.desc())
    )
    trips = result.scalars().all()
    return trips


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities), selectinload(Trip.expenses))
        .where(Trip.id == trip_id)
    )
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    await db.delete(trip)
    await db.commit()
    return None
