from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models import Trip, Stop
from app.schemas.trip import TripResponse

router = APIRouter(prefix="/share", tags=["Sharing"])


@router.get("/{slug}", response_model=TripResponse)
async def get_shared_trip(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities), selectinload(Trip.expenses))
        .where(Trip.share_slug == slug)
    )
    trip = result.scalars().first()
    if not trip or not trip.is_public:
        raise HTTPException(status_code=404, detail="Shared trip not found or trip is set to private")

    return trip
