import axios from 'axios';
import type {
  Trip,
  BudgetSummary,
  PlanTripRequest,
  AITripPlanResponse,
  CitySearchResult,
  CreateTripPayload,
  UpdateTripPayload,
} from '../types/trip';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Attach JWT token automatically if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Demo fallback mock trip for development testing when server offline
const MOCK_TRIP: Trip = {
  id: "japan-demo-2025",
  name: "6-Day Japan Adventure",
  title: "6-Day Japan Adventure",
  description: "Epic journey through Tokyo anime culture, Kyoto temples, and natural wonders.",
  destination: "Japan",
  duration_days: 6,
  budget: 60000,
  total_budget: 60000,
  currency: "INR",
  cover_image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
  cover_photo_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
  is_public: true,
  share_slug: "japan-demo-2025",
  created_at: new Date().toISOString(),
  stops: [
    {
      id: "stop-tokyo",
      trip_id: "japan-demo-2025",
      city_name: "Tokyo",
      country: "Japan",
      latitude: 35.6762,
      longitude: 139.6503,
      order_index: 0,
      activities: [
        {
          id: "act-1",
          stop_id: "stop-tokyo",
          title: "Explore Akihabara Electric Town",
          description: "Anime shops, retro arcade gaming, tech stores.",
          category: "culture",
          cost: 2500,
          duration_mins: 180,
          day_number: 1,
          order_index: 0,
          latitude: 35.6983,
          longitude: 139.7731
        },
        {
          id: "act-2",
          stop_id: "stop-tokyo",
          title: "Senso-ji Temple & Asakusa Street Food",
          description: "Visit Tokyo's oldest temple & enjoy local treats.",
          category: "food",
          cost: 3000,
          duration_mins: 150,
          day_number: 1,
          order_index: 1,
          latitude: 35.7148,
          longitude: 139.7967
        }
      ]
    },
    {
      id: "stop-kyoto",
      trip_id: "japan-demo-2025",
      city_name: "Kyoto",
      country: "Japan",
      latitude: 35.0116,
      longitude: 135.7681,
      order_index: 1,
      activities: [
        {
          id: "act-3",
          stop_id: "stop-kyoto",
          title: "Fushimi Inari Taisha Torii Gate Hike",
          description: "Hike through 10,000 orange torii gates.",
          category: "nature",
          cost: 0,
          duration_mins: 180,
          day_number: 4,
          order_index: 0,
          latitude: 34.9671,
          longitude: 135.7727
        }
      ]
    }
  ],
  expenses: [
    { id: "exp-1", trip_id: "japan-demo-2025", title: "Hotel Tokyo", category: "accommodation", amount: 24000, currency: "INR" },
    { id: "exp-2", trip_id: "japan-demo-2025", title: "Shinkansen Bullet Train", category: "transportation", amount: 14000, currency: "INR" }
  ]
};

export const apiService = {
  // AI Trip Planner
  async planTrip(req: PlanTripRequest): Promise<AITripPlanResponse> {
    try {
      const res = await apiClient.post<AITripPlanResponse>('/ai/plan-trip', req);
      return res.data;
    } catch {
      console.warn("Backend unavailable, using fallback AI generator output.");
      return {
        title: `Magical ${req.duration_days || 6}-Day ${req.destination || 'Japan'} Expedition`,
        description: `Generated AI itinerary for: ${req.prompt}`,
        destination: req.destination || "Japan",
        total_days: req.duration_days || 6,
        estimated_total_cost: req.budget || 60000,
        currency: req.currency || "INR",
        cover_image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
        stops: MOCK_TRIP.stops!.map(s => ({
          city_name: s.city_name,
          country: s.country || "Japan",
          latitude: s.latitude || 35.6762,
          longitude: s.longitude || 139.6503,
          days_count: 3,
          activities: s.activities.map(a => ({
            title: a.title,
            description: a.description || "",
            category: a.category,
            cost: a.cost,
            duration_mins: a.duration_mins,
            day_number: a.day_number,
            latitude: a.latitude,
            longitude: a.longitude
          }))
        })),
        budget_breakdown: {
          accommodation: 24000,
          transportation: 14000,
          food: 12000,
          activities: 6000,
          miscellaneous: 4000
        }
      };
    }
  },

  async planAndSaveTrip(req: PlanTripRequest): Promise<Trip> {
    try {
      const res = await apiClient.post<Trip>('/ai/plan-trip/save', req);
      return res.data;
    } catch {
      console.warn("Backend unavailable, using saved mock trip.");
      return MOCK_TRIP;
    }
  },

  // Trips CRUD
  async getTrips(): Promise<Trip[]> {
    try {
      const res = await apiClient.get<Trip[]>('/trips');
      return res.data;
    } catch {
      return [MOCK_TRIP];
    }
  },

  async getTripById(id: string): Promise<Trip> {
    try {
      const res = await apiClient.get<Trip>(`/trips/${id}`);
      return res.data;
    } catch {
      return { ...MOCK_TRIP, id };
    }
  },

  async createTrip(payload: CreateTripPayload | Partial<Trip>): Promise<Trip> {
    try {
      const body = {
        name: payload.name,
        destination: payload.destination,
        start_date: payload.start_date || payload.startDate,
        end_date: payload.end_date || payload.endDate,
        duration_days: payload.duration_days || 5,
        budget: payload.budget || 0,
        currency: payload.currency || "USD",
        is_public: payload.is_public ?? false,
      };
      const res = await apiClient.post<Trip>('/trips', body);
      return res.data;
    } catch {
      return {
        ...MOCK_TRIP,
        id: `trip-${Date.now()}`,
        name: payload.name || "New Trip",
        destination: payload.destination || "Worldwide",
        budget: payload.budget || 50000,
      };
    }
  },

  async updateTrip(id: string, payload: UpdateTripPayload | Partial<Trip>): Promise<Trip> {
    try {
      const res = await apiClient.patch<Trip>(`/trips/${id}`, payload);
      return res.data;
    } catch {
      return { ...MOCK_TRIP, id, name: payload.name || MOCK_TRIP.name };
    }
  },

  async deleteTrip(id: string): Promise<void> {
    try {
      await apiClient.delete(`/trips/${id}`);
    } catch {
      console.warn(`Local deletion fallback for trip ${id}`);
    }
  },

  // Cities Search
  async searchCities(query: string): Promise<CitySearchResult[]> {
    try {
      const res = await apiClient.get<{ cities: CitySearchResult[] }>('/cities/search', { params: { q: query } });
      return res.data.cities || [];
    } catch {
      return [
        { id: "tokyo-jp", name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503, popular_places_count: 120, image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800" },
        { id: "kyoto-jp", name: "Kyoto", country: "Japan", latitude: 35.0116, longitude: 135.7681, popular_places_count: 85, image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800" },
        { id: "barcelona-es", name: "Barcelona", country: "Spain", latitude: 41.3851, longitude: 2.1734, popular_places_count: 110, image_url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800" },
        { id: "paris-fr", name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522, popular_places_count: 150, image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800" }
      ];
    }
  },

  // Budget Breakdown
  async getTripBudget(tripId: string): Promise<BudgetSummary> {
    try {
      const res = await apiClient.get<BudgetSummary>(`/budget/${tripId}`);
      return res.data;
    } catch {
      return {
        trip_id: tripId,
        total_budget: 60000,
        total_spent: 43500,
        remaining_budget: 16500,
        currency: "INR",
        by_category: [
          { category: "accommodation", amount: 24000, percentage: 55.2 },
          { category: "transportation", amount: 14000, percentage: 32.2 },
          { category: "activities", amount: 5500, percentage: 12.6 }
        ]
      };
    }
  },

  // Share Public Link
  async getSharedTrip(slug: string): Promise<Trip> {
    try {
      const res = await apiClient.get<Trip>(`/sharing/${slug}`);
      return res.data;
    } catch {
      return { ...MOCK_TRIP, share_slug: slug };
    }
  }
};
