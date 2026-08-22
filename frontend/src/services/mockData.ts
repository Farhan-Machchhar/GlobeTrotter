import type { City, Activity, Trip } from '../types';

export const mockCities: City[] = [
  {
    id: 'c1',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 5,
    popularity: 5,
    coordinates: { latitude: 35.6762, longitude: 139.6503 }
  },
  {
    id: 'c2',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 5,
    coordinates: { latitude: 35.0116, longitude: 135.7681 }
  },
  {
    id: 'c3',
    name: 'Osaka',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 4,
    coordinates: { latitude: 34.6937, longitude: 135.5023 }
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    cityId: 'c1',
    name: 'Shibuya Crossing',
    type: 'Sightseeing',
    cost: 0,
    durationMinutes: 60,
    description: 'The busiest pedestrian crossing in the world.'
  },
  {
    id: 'a2',
    cityId: 'c1',
    name: 'Senso-ji Temple',
    type: 'Cultural',
    cost: 0,
    durationMinutes: 90,
    description: "Tokyo's oldest Buddhist temple located in Asakusa."
  },
  {
    id: 'a3',
    cityId: 'c1',
    name: 'Akihabara',
    type: 'Shopping',
    cost: 50,
    durationMinutes: 180,
    description: 'Electric town, center of anime and otaku culture.'
  },
  {
    id: 'a4',
    cityId: 'c2',
    name: 'Fushimi Inari Shrine',
    type: 'Cultural',
    cost: 0,
    durationMinutes: 120,
    description: 'Famous for its thousands of vermilion torii gates.'
  },
  {
    id: 'a5',
    cityId: 'c3',
    name: 'Dotonbori',
    type: 'Food',
    cost: 40,
    durationMinutes: 120,
    description: 'Popular entertainment and food district in Osaka.'
  }
];

// Initial mock trip
export const mockTrip: Trip = {
  id: 't1',
  name: 'Japan Adventure',
  destination: 'Japan',
  startDate: '2026-10-01',
  endDate: '2026-10-06',
  budget: 60000,
  stops: []
};
