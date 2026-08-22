from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models import Trip, Stop, Activity, Expense
from app.schemas.trip import BudgetSummaryResponse, CategoryExpense

router = APIRouter(prefix="/trips", tags=["Budget"])


@router.get("/{trip_id}/budget", response_model=BudgetSummaryResponse)
async def get_trip_budget_summary(trip_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities), selectinload(Trip.expenses))
        .where(Trip.id == trip_id)
    )
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    category_totals = {
        "accommodation": 0.0,
        "transportation": 0.0,
        "food": 0.0,
        "activities": 0.0,
        "other": 0.0,
    }

    # Sum activities cost into activities category
    for stop in trip.stops:
        for act in stop.activities:
            category_totals["activities"] += act.cost or 0.0

    # Sum expense records
    for exp in trip.expenses:
        cat = exp.category if exp.category in category_totals else "other"
        category_totals[cat] += exp.amount or 0.0

    total_spent = sum(category_totals.values())
    remaining_budget = max(0.0, (trip.total_budget or 0.0) - total_spent)

    by_category = []
    for cat, amt in category_totals.items():
        pct = (amt / total_spent * 100.0) if total_spent > 0 else 0.0
        by_category.append(
            CategoryExpense(category=cat, amount=round(amt, 2), percentage=round(pct, 1))
        )

    return BudgetSummaryResponse(
        trip_id=trip.id,
        total_budget=trip.total_budget or 0.0,
        total_spent=round(total_spent, 2),
        remaining_budget=round(remaining_budget, 2),
        currency=trip.currency or "INR",
        by_category=by_category
    )
