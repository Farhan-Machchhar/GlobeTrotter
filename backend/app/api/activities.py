from typing import List, Optional
from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models import Activity, Stop
from app.schemas.trip import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("", response_model=List[ActivityResponse])
async def search_activities(city: Optional[str] = Query(None, description="City name to filter activities")):
    # Demo mock activities list for rich discovery UX
    mock_activities = [
        ActivityResponse(
            id="act-1",
            stop_id="stop-1",
            title="Akihabara Electric & Gaming Tour",
            description="Explore multi-story anime shops, retro gaming centers, and maid cafes.",
            category="culture",
            cost=2500.0,
            duration_mins=180,
            day_number=1,
            order_index=0,
            latitude=35.6983,
            longitude=139.7731,
            place_id="place-akiba",
            is_completed=False
        ),
        ActivityResponse(
            id="act-2",
            stop_id="stop-1",
            title="Senso-ji Temple & Asakusa Street Food",
            description="Visit Tokyo's iconic ancient temple and sample traditional dango & melonpan.",
            category="food",
            cost=3000.0,
            duration_mins=150,
            day_number=1,
            order_index=1,
            latitude=35.7148,
            longitude=139.7967,
            place_id="place-sensoji",
            is_completed=False
        ),
        ActivityResponse(
            id="act-3",
            stop_id="stop-1",
            title="Shibuya Crossing Sunset View",
            description="Experience the world famous scramble intersection from Shibuya Sky deck.",
            category="sightseeing",
            cost=2000.0,
            duration_mins=90,
            day_number=2,
            order_index=0,
            latitude=35.6595,
            longitude=139.7005,
            place_id="place-shibuya",
            is_completed=False
        ),
        ActivityResponse(
            id="act-4",
            stop_id="stop-2",
            title="Fushimi Inari Torii Gate Hike",
            description="Hike through 10,000 vermilion torii gates stretching up Mount Inari.",
            category="nature",
            cost=0.0,
            duration_mins=180,
            day_number=3,
            order_index=0,
            latitude=34.9671,
            longitude=135.7727,
            place_id="place-inari",
            is_completed=False
        ),
        ActivityResponse(
            id="act-5",
            stop_id="stop-2",
            title="Arashiyama Bamboo Forest & River Cruise",
            description="Walk along towering bamboo pathways and ride a wooden boat down the Hozu river.",
            category="nature",
            cost=1800.0,
            duration_mins=210,
            day_number=4,
            order_index=0,
            latitude=35.0170,
            longitude=135.6713,
            place_id="place-arashiyama",
            is_completed=False
        ),
    ]

    if not city:
        return mock_activities

    city_lower = city.lower()
    filtered = [a for a in mock_activities if city_lower in a.title.lower() or city_lower in a.description.lower()]
    return filtered if filtered else mock_activities


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(activity_in: ActivityCreate, db: AsyncSession = Depends(get_db)):
    if not activity_in.stop_id:
        raise HTTPException(status_code=400, detail="stop_id is required")

    result = await db.execute(select(Stop).where(Stop.id == activity_in.stop_id))
    stop = result.scalars().first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")

    activity = Activity(
        stop_id=activity_in.stop_id,
        title=activity_in.title,
        description=activity_in.description,
        category=activity_in.category,
        cost=activity_in.cost,
        duration_mins=activity_in.duration_mins,
        day_number=activity_in.day_number,
        order_index=activity_in.order_index,
        latitude=activity_in.latitude,
        longitude=activity_in.longitude,
        place_id=activity_in.place_id,
        is_completed=activity_in.is_completed
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity
