export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  currency?: string
  status?: string
  createdAt?: string
}

export interface CreateTripPayload {
  name: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
}

export interface UpdateTripPayload {
  name?: string
  destination?: string
  startDate?: string
  endDate?: string
  travelers?: number
  budget?: number
}