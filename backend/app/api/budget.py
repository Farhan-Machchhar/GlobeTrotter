"""
Budget tracking endpoints for GlobeTrotter.
GET    /api/budget/{trip_id}           — Get budget breakdown (Recharts format)
POST   /api/budget/{trip_id}/expenses  — Add expense
"""
import logging
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models import Activity, Expense, Stop, Trip
from app.schemas.trip import BudgetCategoryDetail, BudgetResponse, ExpenseCreate, ExpenseResponse

logger = logging.getLogger("globetrotter.budget")
router = APIRouter(prefix="/budget", tags=["Budget"])

# Map expense categories to canonical names used in Recharts breakdown
_CATEGORIES = ["transport", "accommodation", "activity", "meal", "other"]
_CATEGORY_ALIASES = {
    "transportation": "transport",
    "food": "meal",
    "activities": "activity",
    "sightseeing": "activity",
    "culture": "activity",
    "nature": "activity",
    "relaxation": "other",
    "nightlife": "other",
    "shopping": "other",
}


def _normalize_category(cat: str) -> str:
    """Normalize an expense/activity category to one of the 5 canonical types."""
    cat_lower = cat.lower()
    return _CATEGORY_ALIASES.get(cat_lower, cat_lower if cat_lower in _CATEGORIES else "other")


@router.get("/{trip_id}", response_model=BudgetResponse)
async def get_trip_budget(trip_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a comprehensive budget breakdown for a trip.

    Returns Recharts-compatible format with per-category amount, count, and percentage.
    Also aggregates activity costs from the itinerary.
    """
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities), selectinload(Trip.expenses))
        .where(Trip.id == trip_id)
    )
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    # Accumulate by canonical category
    category_amounts: Dict[str, float] = {c: 0.0 for c in _CATEGORIES}
    category_counts: Dict[str, int] = {c: 0 for c in _CATEGORIES}

    # Sum activity costs → "activity" bucket
    for stop in trip.stops:
        for act in stop.activities:
            if act.cost and act.cost > 0:
                category_amounts["activity"] += act.cost
                category_counts["activity"] += 1

    # Sum manual expense records
    for exp in trip.expenses:
        cat = _normalize_category(exp.category)
        category_amounts[cat] += exp.amount or 0.0
        category_counts[cat] += 1

    total_expense = sum(category_amounts.values())
    total_budget = trip.budget or trip.total_budget or 0.0
    remaining = max(0.0, total_budget - total_expense)

    breakdown: Dict[str, BudgetCategoryDetail] = {}
    for cat in _CATEGORIES:
        amt = category_amounts[cat]
        pct = round((amt / total_expense * 100.0), 2) if total_expense > 0 else 0.0
        breakdown[cat] = BudgetCategoryDetail(
            amount=round(amt, 2),
            count=category_counts[cat],
            percentage=pct,
        )

    return BudgetResponse(
        trip_id=trip.id,
        total_budget=total_budget,
        total_expense=round(total_expense, 2),
        remaining_budget=round(remaining, 2),
        is_over_budget=total_expense > total_budget,
        expense_count=sum(category_counts.values()),
        breakdown=breakdown,
        currency=trip.currency or "USD",
    )


@router.post("/{trip_id}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def add_expense(
    trip_id: str,
    expense_in: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Add a manual expense to a trip's budget.

    Args:
        trip_id: UUID of the trip.
        expense_in: Expense details including category and amount.
    """
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Trip not found.")

    title = expense_in.title or expense_in.description or expense_in.category.capitalize()
    expense = Expense(
        trip_id=trip_id,
        title=title,
        description=expense_in.description,
        category=_normalize_category(expense_in.category),
        amount=expense_in.amount,
        currency=expense_in.currency,
        date=expense_in.date,
    )
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    logger.info(f"Expense added to trip {trip_id}: {expense.category} = {expense.amount}")
    return expense
