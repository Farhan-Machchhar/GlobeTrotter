from datetime import datetime
import uuid
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    trips: Mapped[List["Trip"]] = relationship("Trip", back_populates="user", cascade="all, delete-orphan")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    end_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer, default=1)
    total_budget: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    cover_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    share_slug: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="trips")
    stops: Mapped[List["Stop"]] = relationship("Stop", back_populates="trip", cascade="all, delete-orphan", order_by="Stop.order_index")
    expenses: Mapped[List["Expense"]] = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")


class Stop(Base):
    __tablename__ = "stops"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    city_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    arrival_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    departure_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="stops")
    activities: Mapped[List["Activity"]] = relationship("Activity", back_populates="stop", cascade="all, delete-orphan", order_by="Activity.order_index")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    stop_id: Mapped[str] = mapped_column(String(36), ForeignKey("stops.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="sightseeing")  # sightseeing, food, nature, culture, relaxation, nightlife
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    duration_mins: Mapped[int] = mapped_column(Integer, default=60)
    day_number: Mapped[int] = mapped_column(Integer, default=1)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    place_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    stop: Mapped["Stop"] = relationship("Stop", back_populates="activities")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="other")  # accommodation, transport, food, activities, shopping, other
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="expenses")
