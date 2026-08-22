from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models import Activity, Stop
from app.schemas.trip import ReorderItineraryRequest

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])


@router.post("/reorder", status_code=status.HTTP_200_OK)
async def reorder_itinerary_activities(req: ReorderItineraryRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stop).where(Stop.id == req.stop_id))
    stop = result.scalars().first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")

    for item in req.activities:
        act_res = await db.execute(select(Activity).where(Activity.id == item.id, Activity.stop_id == req.stop_id))
        act = act_res.scalars().first()
        if act:
            act.order_index = item.order_index
            if item.day_number is not None:
                act.day_number = item.day_number

    await db.commit()
    return {"message": "Itinerary activities reordered successfully", "updated_count": len(req.activities)}
