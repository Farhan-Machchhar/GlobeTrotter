import { apiService } from "./api";
import type {
  CreateTripPayload,
  Trip,
  UpdateTripPayload,
} from "@/types/trip";

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  return apiService.createTrip(payload);
}

export async function getTrips(): Promise<Trip[]> {
  return apiService.getTrips();
}

export async function getTrip(id: string): Promise<Trip> {
  return apiService.getTripById(id);
}

export async function updateTrip(
  id: string,
  payload: UpdateTripPayload
): Promise<Trip> {
  return apiService.updateTrip(id, payload);
}

export async function deleteTrip(id: string): Promise<void> {
  return apiService.deleteTrip(id);
}