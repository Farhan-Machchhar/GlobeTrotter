export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number; // e.g. 1-5
  popularity: number; // e.g. 1-5
  coordinates: MapCoordinate;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  type: string;
  cost: number;
  durationMinutes: number;
  description: string;
  imageUrl?: string;
}

export interface PlannedActivity {
  id: string; // Unique ID for this instance in the itinerary
  activityId: string;
  activity: Activity;
  startTime?: string;
  order: number;
}

export interface ItineraryDay {
  id: string;
  date: string; // ISO string
  plannedActivities: PlannedActivity[];
}

export interface TripStop {
  id: string;
  cityId: string;
  city: City;
  order: number;
  days: ItineraryDay[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  stops: TripStop[];
}

export interface Expense {
  category: 'Accommodation' | 'Transport' | 'Activities' | 'Meals' | 'Other';
  amount: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimatedCost: number;
  expensesByCategory: Expense[];
  dailyAverage: number;
  overBudgetDays: string[]; // dates
}

export interface Route {
  coordinates: [number, number][]; // [longitude, latitude] for Mapbox
}
