from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models import Trip, Stop
from app.schemas.trip import StopCreate, StopResponse

router = APIRouter(tags=["Stops"])


@router.post("/trips/{trip_id}/stops", response_model=StopResponse, status_code=status.HTTP_201_CREATED)
async def add_stop_to_trip(trip_id: str, stop_in: StopCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Get max order_index
    max_order = await db.execute(
        select(func.coalesce(func.max(Stop.order_index), -1)).where(Stop.trip_id == trip_id)
    )
    next_order = max_order.scalar() + 1

    stop = Stop(
        trip_id=trip_id,
        city_name=stop_in.city_name,
        country=stop_in.country,
        latitude=stop_in.latitude,
        longitude=stop_in.longitude,
        arrival_date=stop_in.arrival_date,
        departure_date=stop_in.departure_date,
        order_index=next_order
    )
    db.add(stop)
    await db.commit()

    result_stop = await db.execute(
        select(Stop).options(selectinload(Stop.activities)).where(Stop.id == stop.id)
    )
    return result_stop.scalars().first()


@router.delete("/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stop(stop_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stop).where(Stop.id == stop_id))
    stop = result.scalars().first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")

    await db.delete(stop)
    await db.commit()
    return None
