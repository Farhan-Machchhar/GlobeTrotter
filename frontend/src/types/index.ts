export * from './trip';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  costIndex?: number;
  popularity?: number;
  coordinates?: MapCoordinate;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  cover_image_url?: string;
  popular_places_count?: number;
}

export interface Activity {
  id: string;
  cityId?: string;
  title?: string;
  name?: string;
  type?: string;
  category?: string;
  cost: number;
  durationMinutes?: number;
  duration_mins?: number;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  day_number?: number;
  latitude?: number;
  longitude?: number;
}

export interface PlannedActivity {
  id: string;
  activityId?: string;
  activity?: Activity;
  title?: string;
  name?: string;
  cost?: number;
  duration_mins?: number;
  category?: string;
  startTime?: string;
  order?: number;
  order_index?: number;
  day_number?: number;
}

export interface ItineraryDay {
  id?: string;
  date?: string;
  day_number?: number;
  plannedActivities?: PlannedActivity[];
  activities?: PlannedActivity[];
}

export interface TripStop {
  id: string;
  cityId?: string;
  city_name?: string;
  country?: string;
  city?: City;
  order?: number;
  order_index?: number;
  days?: ItineraryDay[];
  activities?: PlannedActivity[];
  latitude?: number;
  longitude?: number;
}

export interface Expense {
  id?: string;
  trip_id?: string;
  title?: string;
  category: string;
  amount: number;
  currency?: string;
}

export interface Route {
  coordinates: [number, number][];
}
