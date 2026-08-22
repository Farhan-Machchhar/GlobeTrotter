"""
Pydantic v2 request/response schemas for GlobeTrotter API.
All schemas follow the frozen API contract agreed with the frontend team.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# ===========================================================================
# Shared / Base
# ===========================================================================

class TimestampMixin(BaseModel):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ===========================================================================
# Auth / User Schemas
# ===========================================================================

class UserCreate(BaseModel):
    """POST /api/auth/signup"""
    email: str = Field(..., description="Valid email address")
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)


class UserLogin(BaseModel):
    """POST /api/auth/login"""
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class UserUpdate(BaseModel):
    """PATCH /api/users/me"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    preferred_language: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===========================================================================
# Activity Schemas
# ===========================================================================

class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "sightseeing"
    activity_type: Optional[str] = None     # alias for category
    cost: float = 0.0
    duration_mins: int = 60
    duration_minutes: Optional[int] = None  # alias
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    day_number: int = 1
    order_index: int = 0
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    place_id: Optional[str] = None
    is_completed: bool = False


class ActivityCreate(ActivityBase):
    stop_id: Optional[str] = None


class ActivityAddToDay(BaseModel):
    """POST /api/itinerary/{day_id}/activities"""
    activity_id: Optional[str] = None   # link existing activity by ID
    # OR inline-create a new activity:
    title: Optional[str] = None
    description: Optional[str] = None
    category: str = "sightseeing"
    cost: float = 0.0
    duration_mins: int = 60
    day_number: int = 1
    order_index: int = 0
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: str
    stop_id: str
    name: Optional[str] = None          # alias for title, for Farhan

    model_config = {"from_attributes": True}


# ===========================================================================
# Stop / City Schemas
# ===========================================================================

class StopBase(BaseModel):
    city_name: str
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    arrival_date: Optional[str] = None
    departure_date: Optional[str] = None
    day_date: Optional[str] = None
    notes: Optional[str] = None
    order_index: int = 0


class StopCreate(StopBase):
    trip_id: Optional[str] = None


class ItineraryDayCreate(BaseModel):
    """POST /api/itinerary/{trip_id}/days"""
    city_id: Optional[str] = None       # city slug (for static city lookup)
    city_name: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    day_date: Optional[str] = None
    notes: Optional[str] = None


class StopResponse(StopBase):
    id: str
    trip_id: str
    activities: List[ActivityResponse] = []

    model_config = {"from_attributes": True}


# ===========================================================================
# Expense Schemas
# ===========================================================================

class ExpenseCreate(BaseModel):
    """POST /api/budget/{trip_id}/expenses"""
    category: str = Field("other", description="transport|accommodation|activity|meal|other")
    description: Optional[str] = None
    title: Optional[str] = None
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    date: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: str
    trip_id: str
    title: str
    description: Optional[str] = None
    category: str
    amount: float
    currency: str
    date: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ===========================================================================
# Trip Schemas
# ===========================================================================

class TripCreate(BaseModel):
    """POST /api/trips"""
    name: Optional[str] = None
    title: Optional[str] = None             # fallback alias
    description: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: int = 1
    budget: Optional[float] = None
    total_budget: Optional[float] = None    # alias
    currency: str = "USD"
    cover_photo_url: Optional[str] = None
    cover_image_url: Optional[str] = None   # alias
    is_public: bool = False
    stops: Optional[List[StopBase]] = []

    @model_validator(mode="after")
    def resolve_name_and_budget(self) -> "TripCreate":
        # Allow either `name` or `title`
        if not self.name and self.title:
            self.name = self.title
        if not self.name:
            self.name = "Untitled Trip"
        # Allow either `budget` or `total_budget`
        if self.budget is None and self.total_budget is not None:
            self.budget = self.total_budget
        if self.budget is None:
            self.budget = 0.0
        return self


class TripUpdate(BaseModel):
    """PATCH /api/trips/{trip_id}"""
    name: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: Optional[int] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    cover_photo_url: Optional[str] = None
    status: Optional[str] = None
    is_public: Optional[bool] = None


class TripResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    creator_id: Optional[str] = None       # alias for user_id (Kavya)
    name: str = ""
    title: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: int = 1
    budget: Optional[float] = None
    total_budget: Optional[float] = None
    currency: str = "USD"
    cover_photo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: str = "planning"
    is_public: bool = False
    share_slug: Optional[str] = None
    destination_count: int = 0              # Kavya's dashboard field
    stops: List[StopResponse] = []
    expenses: List[ExpenseResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def compute_aliases(self) -> "TripResponse":
        # destination_count = number of stops
        self.destination_count = len(self.stops)
        # Alias: creator_id == user_id
        if self.creator_id is None:
            self.creator_id = self.user_id
        # Alias: title == name
        if not self.title:
            self.title = self.name
        # Alias: cover_image_url == cover_photo_url
        if not self.cover_image_url:
            self.cover_image_url = self.cover_photo_url
        # Alias: total_budget == budget
        if self.total_budget is None:
            self.total_budget = self.budget
        return self


# ===========================================================================
# Reorder / Itinerary Schemas
# ===========================================================================

class ReorderItem(BaseModel):
    id: str
    order_index: int
    day_number: Optional[int] = None


class ReorderItineraryRequest(BaseModel):
    stop_id: str
    activities: List[ReorderItem]


# ===========================================================================
# Budget Schemas
# ===========================================================================

class BudgetCategoryDetail(BaseModel):
    """Per-category budget detail for Recharts."""
    amount: float
    count: int
    percentage: float


class BudgetResponse(BaseModel):
    """GET /api/budget/{trip_id} — Recharts-compatible format."""
    trip_id: str
    total_budget: float
    total_expense: float
    remaining_budget: float
    is_over_budget: bool
    expense_count: int
    breakdown: Dict[str, BudgetCategoryDetail]
    currency: str = "USD"


# Legacy alias used by existing budget endpoint
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


# ===========================================================================
# City Schemas  (static city catalogue)
# ===========================================================================

class CitySearchResult(BaseModel):
    id: str
    name: str
    country: str
    region: Optional[str] = None
    latitude: float
    longitude: float
    cost_index: Optional[float] = None
    popularity_score: Optional[int] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    popular_places_count: Optional[int] = None
    image_url: Optional[str] = None         # alias for cover_image_url

    model_config = {"from_attributes": True}


class CitySearchResponse(BaseModel):
    cities: List[CitySearchResult]
    total: int
    page: int
    page_size: int


# ===========================================================================
# Sharing Schemas
# ===========================================================================

class ShareResponse(BaseModel):
    id: Optional[str] = None
    trip_id: str
    slug: str
    share_url: str
    is_active: bool = True
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PublicTripResponse(BaseModel):
    trip_id: str
    name: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    destination: Optional[str] = None
    creator: Optional[str] = None
    slug: str
    cover_photo_url: Optional[str] = None
    stops: List[StopResponse] = []


# ===========================================================================
# AI Trip Planner Schemas
# ===========================================================================

class PlanTripRequest(BaseModel):
    prompt: str = Field(..., description="Natural language prompt")
    destination: Optional[str] = None
    duration_days: Optional[int] = Field(default=5, ge=1, le=30)
    budget: Optional[float] = None
    currency: Optional[str] = "INR"
    interests: Optional[List[str]] = []


class AIActivityItem(BaseModel):
    title: str
    description: str
    category: str
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
