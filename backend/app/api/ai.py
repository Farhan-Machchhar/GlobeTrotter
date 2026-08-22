import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.trip import PlanTripRequest, AITripPlanResponse, TripResponse
from app.services.gemini import gemini_service
from app.models import Trip, Stop, Activity, Expense

router = APIRouter(prefix="/ai", tags=["AI Planner"])


@router.post("/plan-trip", response_model=AITripPlanResponse)
async def generate_ai_trip_plan(req: PlanTripRequest):
    """
    Generates a structured multi-city itinerary using Gemini 2.5/1.5 AI.
    Converts natural language input into validated trip objects.
    """
    if not req.prompt and not req.destination:
        raise HTTPException(status_code=400, detail="Prompt or destination must be provided")

    ai_plan = await gemini_service.generate_trip_plan(req)
    return ai_plan


@router.post("/plan-trip/save", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def generate_and_save_ai_trip(req: PlanTripRequest, db: AsyncSession = Depends(get_db)):
    """
    Generates an AI trip plan and directly converts it into persistent database models.
    """
    ai_plan = await gemini_service.generate_trip_plan(req)
    share_slug = str(uuid.uuid4())[:8]

    trip = Trip(
        name=ai_plan.title,
        title=ai_plan.title,
        description=ai_plan.description,
        destination=ai_plan.destination,
        duration_days=ai_plan.total_days,
        budget=ai_plan.estimated_total_cost,
        total_budget=ai_plan.estimated_total_cost,
        currency=ai_plan.currency,
        cover_photo_url=ai_plan.cover_image_url or "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
        cover_image_url=ai_plan.cover_image_url or "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
        is_public=True,
        share_slug=share_slug
    )
    db.add(trip)
    await db.flush()

    # Add stops & activities
    for s_idx, stop_item in enumerate(ai_plan.stops):
        stop = Stop(
            trip_id=trip.id,
            city_name=stop_item.city_name,
            country=stop_item.country,
            latitude=stop_item.latitude,
            longitude=stop_item.longitude,
            order_index=s_idx
        )
        db.add(stop)
        await db.flush()

        for a_idx, act_item in enumerate(stop_item.activities):
            act = Activity(
                stop_id=stop.id,
                title=act_item.title,
                name=act_item.title,
                description=act_item.description,
                category=act_item.category,
                activity_type=act_item.category,
                cost=act_item.cost,
                duration_mins=act_item.duration_mins,
                duration_minutes=act_item.duration_mins,
                day_number=act_item.day_number,
                order_index=a_idx,
                latitude=act_item.latitude,
                longitude=act_item.longitude
            )
            db.add(act)

    # Add expenses from AI budget breakdown
    if ai_plan.budget_breakdown:
        breakdown = ai_plan.budget_breakdown
        categories = [
            ("Accommodation", "accommodation", breakdown.accommodation),
            ("Intercity Transport", "transportation", breakdown.transportation),
            ("Dining & Snacks", "food", breakdown.food),
            ("Sightseeing & Tickets", "activities", breakdown.activities),
            ("Emergency & Misc", "other", breakdown.miscellaneous)
        ]
        for title, cat, amt in categories:
            if amt > 0:
                exp = Expense(
                    trip_id=trip.id,
                    title=title,
                    category=cat,
                    amount=amt,
                    currency=ai_plan.currency
                )
                db.add(exp)

    await db.commit()
    from app.api.trips import _load_trip_query
    result = await db.execute(_load_trip_query(trip.id))
    return result.scalars().first()
