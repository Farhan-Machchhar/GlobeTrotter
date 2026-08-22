import { create } from 'zustand';
import type { City } from '../types';

interface TravelState {
  selectedCity: City | null;
  setSelectedCity: (city: City | null) => void;
  hoveredCityId: string | null;
  setHoveredCityId: (id: string | null) => void;
  selectedTripId: string;
  setSelectedTripId: (id: string) => void;
}

export const useTravelStore = create<TravelState>((set) => ({
  selectedCity: null,
  setSelectedCity: (city) => set({ selectedCity: city }),
  hoveredCityId: null,
  setHoveredCityId: (id) => set({ hoveredCityId: id }),
  selectedTripId: 't1', // Default to mock trip for now
  setSelectedTripId: (id) => set({ selectedTripId: id }),
}));
