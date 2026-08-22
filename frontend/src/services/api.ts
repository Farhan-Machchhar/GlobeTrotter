import axios from 'axios';
import type { City, Activity, Trip, TripStop, ItineraryDay } from '../types';
import type { PlanTripRequest, AITripPlanResponse } from '../types/trip';

const client = axios.create({
  baseURL: '/api'
});

// We need a persistent trip ID mapping since 'trip123' is hardcoded in store.
let realTripId: string | null = null;

const ensureRealTripId = async () => {
  if (realTripId) return realTripId;
  const { data: trips } = await client.get('/trips');
  if (trips.length > 0) {
    realTripId = trips[0].id;
  } else {
    const { data: newTrip } = await client.post('/trips', { name: "Hackathon Demo Trip", budget: 5000 });
    realTripId = newTrip.id;
  }
  return realTripId;
};

// Map backend TripResponse to frontend Trip
const mapTrip = (backendTrip: any): Trip => {
  const stops: TripStop[] = (backendTrip.stops || []).map((s: any) => {
    
    const daysMap = new Map<number, ItineraryDay>();
    
    // If no activities, ensure at least Day 1 exists
    if (!s.activities || s.activities.length === 0) {
       daysMap.set(1, {
          id: `day_${s.id}_1`,
          date: s.day_date || '',
          plannedActivities: []
       });
    }

    (s.activities || []).forEach((a: any) => {
      let day = daysMap.get(a.day_number);
      if (!day) {
        day = {
          id: `day_${s.id}_${a.day_number}`,
          date: s.day_date || '', 
          plannedActivities: []
        };
        daysMap.set(a.day_number, day);
      }
      day.plannedActivities.push({
        id: a.id,
        activityId: a.id,
        activity: {
           id: a.id,
           cityId: s.id,
           name: a.name || a.title,
           type: a.category,
           cost: a.cost,
           durationMinutes: a.duration_mins,
           description: a.description
        },
        order: a.order_index
      });
    });

    // Ensure they are sorted by day_number
    const sortedDays = Array.from(daysMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(entry => entry[1]);

    // Sort planned activities by order
    sortedDays.forEach(d => {
      d.plannedActivities.sort((a, b) => a.order - b.order);
    });
    
    return {
      id: s.id,
      cityId: s.city_name,
      city: {
        id: s.city_name, // slug used as ID
        name: s.city_name,
        country: s.country,
        region: '',
        costIndex: 5,
        popularity: 5,
        coordinates: { latitude: s.latitude, longitude: s.longitude }
      },
      order: s.order_index,
      days: sortedDays
    };
  });

  return {
    id: backendTrip.id,
    name: backendTrip.title || backendTrip.name,
    startDate: backendTrip.start_date || '',
    endDate: backendTrip.end_date || '',
    budget: backendTrip.budget || 0,
    stops: stops.sort((a, b) => a.order - b.order)
  };
};

const cityCache = new Map<string, City>();

export const api = {
  searchCities: async (query: string): Promise<City[]> => {
    const res = await client.get('/cities/search', { params: { q: query } });
    const cities: City[] = res.data.cities.map((c: any) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region || '',
      costIndex: c.cost_index || 5,
      popularity: c.popularity_score || 50,
      coordinates: { latitude: c.latitude, longitude: c.longitude }
    }));

    // OpenStreetMap Nominatim Geocoding API for keyless global search
    if (query && query.trim().length >= 2) {
      try {
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: query,
              format: 'json',
              addressdetails: 1,
              limit: 5
            }
          }
        );
        const osmCities: City[] = (geoRes.data || []).map((f: any) => {
          const name = f.address?.city || f.address?.town || f.address?.village || f.display_name.split(',')[0];
          const country = f.address?.country || f.display_name.split(',').pop()?.trim() || 'Worldwide';
          const slug = `osm-${f.place_id}`;
          return {
            id: slug,
            name: name,
            country: country,
            region: f.address?.state || '',
            costIndex: 5,
            popularity: 80,
            coordinates: { latitude: parseFloat(f.lat), longitude: parseFloat(f.lon) }
          };
        });

        for (const oc of osmCities) {
          if (!cities.some(c => c.name.toLowerCase() === oc.name.toLowerCase())) {
            cities.push(oc);
          }
        }
      } catch (err) {
        console.warn('OpenStreetMap Nominatim search fallback:', err);
      }
    }

    cities.forEach(c => cityCache.set(c.id, c));
    return cities;
  },

  getActivities: async (cityId: string): Promise<Activity[]> => {
    return [
       { id: `a1_${cityId}`, cityId, name: 'Guided City Tour', type: 'sightseeing', cost: 15, durationMinutes: 120, description: 'Walking tour' },
       { id: `a2_${cityId}`, cityId, name: 'National Museum', type: 'culture', cost: 25, durationMinutes: 180, description: 'Local museum' },
       { id: `a3_${cityId}`, cityId, name: 'Fine Dining Experience', type: 'food', cost: 80, durationMinutes: 90, description: 'Local cuisine' }
    ];
  },

  getTrip: async (_id: string): Promise<Trip> => {
    const tripId = await ensureRealTripId();
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },

  addStop: async (_tripId: string, cityId: string): Promise<Trip> => {
    const tripId = await ensureRealTripId();
    let city = cityCache.get(cityId);
    if (!city) {
      try {
        const cityRes = await client.get(`/cities/${cityId}`);
        const c = cityRes.data;
        city = {
          id: c.id,
          name: c.name,
          country: c.country,
          region: c.region || '',
          costIndex: 5,
          popularity: 5,
          coordinates: { latitude: c.latitude, longitude: c.longitude }
        };
      } catch {
        city = {
          id: cityId,
          name: cityId.replace(/-/g, ' ').toUpperCase(),
          country: 'Worldwide',
          region: '',
          costIndex: 5,
          popularity: 5,
          coordinates: { latitude: 20.5937, longitude: 78.9629 }
        };
      }
    }
    
    await client.post(`/trips/${tripId}/stops`, {
      city_name: city.name,
      country: city.country,
      latitude: city.coordinates.latitude,
      longitude: city.coordinates.longitude
    });
    
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },

  removeStop: async (_tripId: string, stopId: string): Promise<Trip> => {
    const tripId = await ensureRealTripId();
    await client.delete(`/stops/${stopId}`);
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },

  addItineraryDay: async (_tripId: string, _stopId: string, _date: string): Promise<Trip> => {
    const tripId = await ensureRealTripId();
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },

  addActivityToDay: async (_tripId: string, stopId: string, dayId: string, activityId: string): Promise<Trip> => {
    const tripId = await ensureRealTripId();
    const dayNumber = parseInt(dayId.split('_').pop() || '1');
    
    let act = {
       title: 'New Activity',
       category: 'sightseeing',
       cost: 25,
       duration_mins: 120,
       day_number: dayNumber
    };

    if (activityId.startsWith('a1_')) {
      act = { ...act, title: 'Guided City Tour', category: 'sightseeing', cost: 15, duration_mins: 120 };
    } else if (activityId.startsWith('a2_')) {
      act = { ...act, title: 'National Museum', category: 'culture', cost: 25, duration_mins: 180 };
    } else if (activityId.startsWith('a3_')) {
      act = { ...act, title: 'Fine Dining Experience', category: 'food', cost: 80, duration_mins: 90 };
    }
    
    await client.post(`/itinerary/${stopId}/activities`, act);
    
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },

  removeActivityFromDay: async (_tripId: string, _stopId: string, _dayId: string, plannedActivityId: string): Promise<Trip> => {
    const tripId = await ensureRealTripId();
    await client.delete(`/itinerary/activities/${plannedActivityId}`);
    
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },
  
  reorderStops: async (_tripId: string, _stopIds: string[]): Promise<Trip> => {
    // Fake local UI update since backend doesn't have a bulk stop reorder
    const tripId = await ensureRealTripId();
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },

  reorderActivities: async (_tripId: string, stopId: string, _dayId: string, plannedActivityIds: string[]): Promise<Trip> => {
    const tripId = await ensureRealTripId();
    const payload = {
       stop_id: stopId,
       activities: plannedActivityIds.map((id, index) => ({ id, order_index: index }))
    };
    
    await client.post(`/itinerary/reorder`, payload);
    const res = await client.get(`/trips/${tripId}`);
    return mapTrip(res.data);
  },
  
  updateTripDirect: async (trip: Trip): Promise<Trip> => {
      return trip;
  },

  planTrip: async (req: PlanTripRequest): Promise<AITripPlanResponse> => {
    try {
      const res = await client.post<AITripPlanResponse>('/ai/plan-trip', req);
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
        stops: [],
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

  planAndSaveTrip: async (req: PlanTripRequest): Promise<Trip> => {
    const res = await client.post<any>('/ai/plan-trip/save', req);
    return mapTrip(res.data);
  }
};
