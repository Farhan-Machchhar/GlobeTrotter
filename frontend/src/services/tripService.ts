import type {
  CreateTripPayload,
  Trip,
  UpdateTripPayload,
} from "@/types/trip"

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000"

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    }
  )

  if (!response.ok) {
    const message = await response.text()

    throw new Error(
      message || `Request failed: ${response.status}`
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export async function createTrip(
  payload: CreateTripPayload
) {
  return request<Trip>("/api/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getTrips() {
  return request<Trip[]>("/api/trips")
}

export async function getTrip(id: string) {
  return request<Trip>(`/api/trips/${id}`)
}

export async function updateTrip(
  id: string,
  payload: UpdateTripPayload
) {
  return request<Trip>(`/api/trips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteTrip(id: string) {
  return request<void>(`/api/trips/${id}`, {
    method: "DELETE",
  })
}