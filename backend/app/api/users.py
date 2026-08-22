"""
User profile endpoints for GlobeTrotter.
GET    /api/users/me
GET    /api/users/{user_id}
PATCH  /api/users/me
DELETE /api/users/me
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models import User
from app.schemas.trip import UserResponse, UserUpdate

logger = logging.getLogger("globetrotter.users")
router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's full profile."""
    return UserResponse.model_validate(current_user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a public user profile by ID.

    Args:
        user_id: UUID of the user.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    update_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the authenticated user's profile fields."""
    # Check username uniqueness if changing
    if update_in.username and update_in.username != current_user.username:
        result = await db.execute(select(User).where(User.username == update_in.username))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Username already taken.")

    update_data = update_in.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    # Recompute full_name if parts changed
    if "first_name" in update_data or "last_name" in update_data:
        current_user.full_name = " ".join(
            filter(None, [current_user.first_name, current_user.last_name])
        )

    await db.commit()
    await db.refresh(current_user)
    logger.info(f"Profile updated for user: {current_user.id}")
    return UserResponse.model_validate(current_user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Permanently delete the authenticated user's account and all their trips."""
    logger.warning(f"Deleting account for user: {current_user.email} (id={current_user.id})")
    await db.delete(current_user)
    await db.commit()
    return None
