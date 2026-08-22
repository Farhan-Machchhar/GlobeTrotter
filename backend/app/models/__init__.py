"""
SQLAlchemy ORM models for GlobeTrotter.
All models use UUID primary keys and include created_at / updated_at timestamps.
"""
from datetime import datetime
import uuid
from typing import List, Optional

from sqlalchemy import (
    Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class User(Base):
    """Platform user account."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_picture_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trips: Mapped[List["Trip"]] = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    saved_destinations: Mapped[List["SavedDestination"]] = relationship(
        "SavedDestination", back_populates="user", cascade="all, delete-orphan"
    )
    shares: Mapped[List["Share"]] = relationship("Share", back_populates="user", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Trip
# ---------------------------------------------------------------------------

class Trip(Base):
    """A multi-city travel plan created by a user."""
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    # 'name' is the canonical field per API contract; 'title' kept for compat
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # alias / legacy
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    destination: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    end_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer, default=1)
    budget: Mapped[float] = mapped_column(Float, default=0.0)
    total_budget: Mapped[float] = mapped_column(Float, default=0.0)  # alias for budget
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    cover_photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cover_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # alias
    status: Mapped[str] = mapped_column(String(20), default="planning")  # planning/confirmed/completed/cancelled
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    share_slug: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="trips")
    stops: Mapped[List["Stop"]] = relationship(
        "Stop", back_populates="trip", cascade="all, delete-orphan", order_by="Stop.order_index"
    )
    expenses: Mapped[List["Expense"]] = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    shares: Mapped[List["Share"]] = relationship("Share", back_populates="trip", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Stop  (represents a city/destination within a trip)
# ---------------------------------------------------------------------------

class Stop(Base):
    """A city stop in a trip's itinerary. Also doubles as an ItineraryDay container."""
    __tablename__ = "stops"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    trip_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    city_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    arrival_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    departure_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    day_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # itinerary day alias
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    trip: Mapped["Trip"] = relationship("Trip", back_populates="stops")
    activities: Mapped[List["Activity"]] = relationship(
        "Activity", back_populates="stop", cascade="all, delete-orphan", order_by="Activity.order_index"
    )


# ---------------------------------------------------------------------------
# Activity
# ---------------------------------------------------------------------------

class Activity(Base):
    """A single activity/attraction planned within a Stop."""
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    stop_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("stops.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # alias for title
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="sightseeing")
    activity_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # alias for category
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    duration_mins: Mapped[int] = mapped_column(Integer, default=60)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # alias
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    day_number: Mapped[int] = mapped_column(Integer, default=1)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    start_time: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # "09:00"
    end_time: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)    # "11:30"
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    place_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    google_place_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # alias
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    stop: Mapped["Stop"] = relationship("Stop", back_populates="activities")


# ---------------------------------------------------------------------------
# Expense
# ---------------------------------------------------------------------------

class Expense(Base):
    """A budget expense entry for a trip."""
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    trip_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="other")
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    trip: Mapped["Trip"] = relationship("Trip", back_populates="expenses")


# ---------------------------------------------------------------------------
# SavedDestination  (user favourite cities)
# ---------------------------------------------------------------------------

class SavedDestination(Base):
    """A city saved as a favourite by a user."""
    __tablename__ = "saved_destinations"
    __table_args__ = (UniqueConstraint("user_id", "city_id", name="uq_user_city"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    city_id: Mapped[str] = mapped_column(String(100), nullable=False)  # city slug e.g. "tokyo-jp"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_destinations")


# ---------------------------------------------------------------------------
# Share  (public trip share links)
# ---------------------------------------------------------------------------

class Share(Base):
    """Public share link for a trip."""
    __tablename__ = "shares"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    trip_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    trip: Mapped["Trip"] = relationship("Trip", back_populates="shares")
    user: Mapped["User"] = relationship("User", back_populates="shares")
