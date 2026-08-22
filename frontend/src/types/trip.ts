export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'nature'
  | 'culture'
  | 'relaxation'
  | 'nightlife';

export type ExpenseCategory =
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'other';

export interface Activity {
  id: string;
  stop_id: string;
  title: string;
  name?: string;
  description?: string;
  category: ActivityCategory;
  cost: number;
  duration_mins: number;
  day_number: number;
  order_index: number;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  is_completed?: boolean;
}

export interface Stop {
  id: string;
  trip_id: string;
  city_name: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  arrival_date?: string;
  departure_date?: string;
  order_index: number;
  activities: Activity[];
}

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date?: string;
}

export interface Trip {
  id: string;
  user_id?: string;
  creator_id?: string;
  name: string;
  title?: string;
  description?: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  startDate?: string;
  endDate?: string;
  duration_days?: number;
  budget?: number;
  total_budget?: number;
  currency?: string;
  cover_image_url?: string;
  cover_photo_url?: string;
  coverImage?: string;
  status?: string;
  is_public?: boolean;
  share_slug?: string;
  destination_count?: number;
  travelers?: number;
  created_at?: string;
  createdAt?: string;
  stops?: Stop[];
  expenses?: Expense[];
}

export interface CreateTripPayload {
  name?: string;
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  travelers?: number;
  budget?: number;
  total_budget?: number;
  currency?: string;
  is_public?: boolean;
  cover_image_url?: string;
  cover_photo_url?: string;
}

export interface UpdateTripPayload {
  name?: string;
  title?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  travelers?: number;
  budget?: number;
  total_budget?: number;
  currency?: string;
  status?: string;
  is_public?: boolean;
  cover_image_url?: string;
  cover_photo_url?: string;
}

export interface CategoryExpenseSummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface BudgetSummary {
  trip_id: string;
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  currency: string;
  by_category: CategoryExpenseSummary[];
}

export interface PlanTripRequest {
  prompt: string;
  destination?: string;
  duration_days?: number;
  budget?: number;
  currency?: string;
  interests?: string[];
}

export interface AIActivityItem {
  title: string;
  description: string;
  category: ActivityCategory;
  cost: number;
  duration_mins: number;
  day_number: number;
  latitude?: number;
  longitude?: number;
}

export interface AIStopItem {
  city_name: string;
  country: string;
  latitude: number;
  longitude: number;
  days_count: number;
  activities: AIActivityItem[];
}

export interface AIBudgetBreakdown {
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  miscellaneous: number;
}

export interface AITripPlanResponse {
  title: string;
  description: string;
  destination: string;
  total_days: number;
  estimated_total_cost: number;
  currency: string;
  cover_image_url?: string;
  stops: AIStopItem[];
  budget_breakdown: AIBudgetBreakdown;
}

export interface CitySearchResult {
  id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  cost_index?: number;
  popularity_score?: number;
  description?: string;
  popular_places_count?: number;
  image_url?: string;
  cover_image_url?: string;
}
