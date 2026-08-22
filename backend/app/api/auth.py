"""
Authentication endpoints for GlobeTrotter.
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/forgot-password
GET  /api/auth/me
"""
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database.session import get_db
from app.models import User
from app.schemas.trip import (
    ForgotPasswordRequest, TokenResponse, UserCreate, UserLogin, UserResponse,
)

logger = logging.getLogger("globetrotter.auth")
router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user account.

    Returns a JWT access token and user profile on success.
    """
    # Check email uniqueness
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Check username uniqueness if provided
    if user_in.username:
        result = await db.execute(select(User).where(User.username == user_in.username))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Username already taken.")

    full_name = user_in.full_name
    if not full_name and (user_in.first_name or user_in.last_name):
        full_name = " ".join(filter(None, [user_in.first_name, user_in.last_name]))

    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        full_name=full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info(f"New user registered: {user.email} (id={user.id})")
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate with email + password.

    Returns a JWT access token on success.
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated.")

    logger.info(f"User logged in: {user.email}")
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Trigger a password reset flow.

    For the hackathon MVP, this always returns success to avoid email enumeration.
    In production, send a reset email here.
    """
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    if user:
        logger.info(f"Password reset requested for: {user.email}")
        # TODO: send reset email via SendGrid / Resend

    # Always 200 — don't reveal whether email exists
    return {"message": "If that email exists, a reset link has been sent."}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)
