from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# --- Auth Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Activity Schemas ---
class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "sightseeing"
    cost: float = 0.0
    duration_mins: int = 60
    day_number: int = 1
    order_index: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_id: Optional[str] = None
    is_completed: bool = False

class ActivityCreate(ActivityBase):
    stop_id: Optional[str] = None

class ActivityResponse(ActivityBase):
    id: str
    stop_id: str
    class Config:
        from_attributes = True


# --- Stop (City) Schemas ---
class StopBase(BaseModel):
    city_name: str
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    arrival_date: Optional[str] = None
    departure_date: Optional[str] = None
    order_index: int = 0

class StopCreate(StopBase):
    trip_id: Optional[str] = None

class StopResponse(StopBase):
    id: str
    trip_id: str
    activities: List[ActivityResponse] = []
    class Config:
        from_attributes = True


# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    title: str
    category: str = "other"
    amount: float = 0.0
    currency: str = "INR"
    date: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    trip_id: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: str
    trip_id: str
    class Config:
        from_attributes = True


# --- Trip Schemas ---
class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    destination: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: int = 1
    total_budget: float = 0.0
    currency: str = "INR"
    cover_image_url: Optional[str] = None
    is_public: bool = False

class TripCreate(TripBase):
    stops: Optional[List[StopBase]] = []

class TripResponse(TripBase):
    id: str
    user_id: Optional[str] = None
    share_slug: Optional[str] = None
    created_at: datetime
    stops: List[StopResponse] = []
    expenses: List[ExpenseResponse] = []
    class Config:
        from_attributes = True


# --- Reorder / Itinerary Schemas ---
class ReorderItem(BaseModel):
    id: str
    order_index: int
    day_number: Optional[int] = None

class ReorderItineraryRequest(BaseModel):
    stop_id: str
    activities: List[ReorderItem]


# --- Budget Summary Schema ---
class CategoryExpense(BaseModel):
    category: str
    amount: float
    percentage: float

class BudgetSummaryResponse(BaseModel):
    trip_id: str
    total_budget: float
    total_spent: float
    remaining_budget: float
    currency: str
    by_category: List[CategoryExpense]


# --- AI Trip Planner Schemas ---
class PlanTripRequest(BaseModel):
    prompt: str = Field(..., description="Natural language prompt like 'Plan a 6-day Japan trip under ₹60,000. I like anime, food and nature.'")
    destination: Optional[str] = None
    duration_days: Optional[int] = Field(default=5, ge=1, le=30)
    budget: Optional[float] = None
    currency: Optional[str] = "INR"
    interests: Optional[List[str]] = []

class AIActivityItem(BaseModel):
    title: str
    description: str
    category: str  # sightseeing, food, nature, culture, relaxation, nightlife
    cost: float
    duration_mins: int
    day_number: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AIStopItem(BaseModel):
    city_name: str
    country: str
    latitude: float
    longitude: float
    days_count: int
    activities: List[AIActivityItem]

class AIBudgetBreakdown(BaseModel):
    accommodation: float
    transportation: float
    food: float
    activities: float
    miscellaneous: float

class AITripPlanResponse(BaseModel):
    title: str
    description: str
    destination: str
    total_days: int
    estimated_total_cost: float
    currency: str
    cover_image_url: Optional[str] = None
    stops: List[AIStopItem]
    budget_breakdown: AIBudgetBreakdown
