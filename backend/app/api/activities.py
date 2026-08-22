"""
Activity endpoints for GlobeTrotter.
GET    /api/activities               — Search/filter activities
GET    /api/activities/{id}          — Get single activity
POST   /api/activities               — Create activity for a stop
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models import Activity, Stop
from app.schemas.trip import ActivityCreate, ActivityResponse

logger = logging.getLogger("globetrotter.activities")
router = APIRouter(prefix="/activities", tags=["Activities"])

# ---------------------------------------------------------------------------
# Seed / demo activities (used when DB is empty) — lat/lng for Mapbox (Farhan)
# ---------------------------------------------------------------------------
_DEMO_ACTIVITIES: List[ActivityResponse] = [
    ActivityResponse(
        id="act-1", stop_id="stop-demo",
        title="Akihabara Electric & Gaming Tour",
        description="Explore multi-story anime shops, retro gaming centers, and maid cafés.",
        category="culture", activity_type="culture",
        cost=2500.0, duration_mins=180, rating=4.7, day_number=1, order_index=0,
        latitude=35.6983, longitude=139.7731, image_url="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800",
    ),
    ActivityResponse(
        id="act-2", stop_id="stop-demo",
        title="Senso-ji Temple & Asakusa Street Food",
        description="Visit Tokyo's iconic ancient temple and sample traditional dango & melonpan.",
        category="food", activity_type="food",
        cost=3000.0, duration_mins=150, rating=4.9, day_number=1, order_index=1,
        latitude=35.7148, longitude=139.7967, image_url="https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=800",
    ),
    ActivityResponse(
        id="act-3", stop_id="stop-demo",
        title="Shibuya Crossing Sunset View",
        description="Experience the world-famous scramble intersection from Shibuya Sky Deck.",
        category="sightseeing", activity_type="sightseeing",
        cost=2000.0, duration_mins=90, rating=4.8, day_number=2, order_index=0,
        latitude=35.6595, longitude=139.7005, image_url="https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=800",
    ),
    ActivityResponse(
        id="act-4", stop_id="stop-demo",
        title="Fushimi Inari Torii Gate Hike",
        description="Hike through 10,000 vermilion torii gates stretching up Mount Inari.",
        category="nature", activity_type="nature",
        cost=0.0, duration_mins=180, rating=4.9, day_number=3, order_index=0,
        latitude=34.9671, longitude=135.7727, image_url="https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=800",
    ),
    ActivityResponse(
        id="act-5", stop_id="stop-demo",
        title="Arashiyama Bamboo Forest & River Cruise",
        description="Walk along towering bamboo pathways and ride a wooden boat down Hozu river.",
        category="nature", activity_type="nature",
        cost=1800.0, duration_mins=210, rating=4.8, day_number=4, order_index=0,
        latitude=35.0170, longitude=135.6713, image_url="https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800",
    ),
    ActivityResponse(
        id="act-6", stop_id="stop-demo",
        title="Sagrada Família Guided Tour",
        description="Gaudí's awe-inspiring basilica with intricate facades and stunning light play inside.",
        category="culture", activity_type="culture",
        cost=3500.0, duration_mins=120, rating=4.9, day_number=1, order_index=0,
        latitude=41.4036, longitude=2.1744, image_url="https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800",
    ),
    ActivityResponse(
        id="act-7", stop_id="stop-demo",
        title="La Boqueria Market Food Experience",
        description="Taste fresh seafood, jamón, and exotic fruits at Barcelona's iconic food market.",
        category="food", activity_type="food",
        cost=1500.0, duration_mins=90, rating=4.7, day_number=2, order_index=0,
        latitude=41.3817, longitude=2.1720, image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800",
    ),
]

_DEMO_MAP = {a.id: a for a in _DEMO_ACTIVITIES}


@router.get("", response_model=List[ActivityResponse])
async def search_activities(
    city_id: Optional[str] = Query(None, description="City slug (e.g. tokyo-jp)"),
    activity_type: Optional[str] = Query(None, description="Category filter"),
    min_cost: Optional[float] = Query(None, ge=0),
    max_cost: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Search and filter activities.

    Falls back to demo activities if database has no activities yet.
    All activities include latitude/longitude for Mapbox markers.
    """
    # Try DB first
    q = select(Activity)
    if activity_type:
        q = q.where(Activity.category == activity_type)
    if min_cost is not None:
        q = q.where(Activity.cost >= min_cost)
    if max_cost is not None:
        q = q.where(Activity.cost <= max_cost)
    q = q.offset(skip).limit(limit)

    result = await db.execute(q)
    db_activities = result.scalars().all()

    if db_activities:
        return db_activities

    # Fallback to demo data
    demo = list(_DEMO_ACTIVITIES)
    if activity_type:
        demo = [a for a in demo if a.category == activity_type]
    if min_cost is not None:
        demo = [a for a in demo if a.cost >= min_cost]
    if max_cost is not None:
        demo = [a for a in demo if a.cost <= max_cost]
    if city_id:
        cl = city_id.lower()
        demo = [a for a in demo if cl in a.title.lower() or cl in (a.description or "").lower()]

    return demo[skip: skip + limit]


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(activity_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single activity by ID. Checks DB first, then demo catalogue."""
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    act = result.scalars().first()
    if act:
        return act
    # Check demo
    demo = _DEMO_MAP.get(activity_id)
    if demo:
        return demo
    raise HTTPException(status_code=404, detail="Activity not found.")


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(activity_in: ActivityCreate, db: AsyncSession = Depends(get_db)):
    """Create a new activity attached to a stop."""
    if not activity_in.stop_id:
        raise HTTPException(status_code=400, detail="stop_id is required.")

    result = await db.execute(select(Stop).where(Stop.id == activity_in.stop_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Stop not found.")

    activity = Activity(
        stop_id=activity_in.stop_id,
        title=activity_in.title,
        name=activity_in.title,
        description=activity_in.description,
        category=activity_in.category,
        activity_type=activity_in.category,
        cost=activity_in.cost,
        duration_mins=activity_in.duration_mins,
        rating=activity_in.rating,
        day_number=activity_in.day_number,
        order_index=activity_in.order_index,
        start_time=activity_in.start_time,
        end_time=activity_in.end_time,
        latitude=activity_in.latitude,
        longitude=activity_in.longitude,
        image_url=activity_in.image_url,
        place_id=activity_in.place_id,
        is_completed=activity_in.is_completed,
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity
