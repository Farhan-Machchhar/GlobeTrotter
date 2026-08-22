import type React from "react"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  Users,
  Wallet,
} from "lucide-react"
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  deleteTrip,
  getTrip,
} from "@/services/tripService"

import type { Trip } from "@/types/trip"
import { ErrorState } from "@/components/travel/ErrorState"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { useTravelStore } from "@/store/travelStore"
import { WorldMap } from "@/components/map/WorldMap"
import { CitySearch } from "@/components/discovery/CitySearch"
import { ItineraryBuilder } from "@/components/itinerary/ItineraryBuilder"
import { TripTimeline } from "@/components/timeline/TripTimeline"
import { BudgetDashboard } from "@/components/budget/BudgetDashboard"

function TripDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { selectedTripId } = useTravelStore()

  const { data: farhanTrip } = useQuery({
    queryKey: ['trip', selectedTripId],
    queryFn: () => api.getTrip(selectedTripId)
  })

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', ''],
    queryFn: () => api.searchCities('')
  })

  useEffect(() => {
    if (id && id !== selectedTripId) {
      useTravelStore.getState().setSelectedTripId(id);
    }
  }, [id, selectedTripId])

  useEffect(() => {
    if (!id) return

    async function loadTrip(tripId: string) {
      try {
        const data = await getTrip(tripId)
        setTrip(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load trip."
        )
      } finally {
        setLoading(false)
      }
    }

    loadTrip(id)
  }, [id])

  async function handleDelete() {
    if (!id) return

    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    )

    if (!confirmed) return

    try {
      await deleteTrip(id)
      navigate("/my-trips")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete trip."
      )
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
        Loading trip...
      </main>
    )
  }

  if (error || !trip) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title={error ? "Unable to load trip" : "Trip not found"}
          description={
            error ||
            "We couldn't find the trip you're looking for."
          }
          onRetry={() => window.location.reload()}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

      <Link
        to="/my-trips"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my trips
      </Link>

      <Card>

        <CardHeader>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <CardTitle className="text-2xl">
                {trip.name}
              </CardTitle>

              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                {trip.destination}
              </p>
            </div>

            <div className="flex gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/trip/${trip.id}/edit`)}
              >
                <Pencil />
                Edit
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 />
                Delete
              </Button>

            </div>

          </div>
        </CardHeader>

        <CardContent>

          <div className="grid gap-4 sm:grid-cols-2">

            <InfoItem
              icon={<CalendarDays />}
              label="Dates"
              value={`${trip.startDate} — ${trip.endDate}`}
            />

            <InfoItem
              icon={<Users />}
              label="Travelers"
              value={`${trip.travelers}`}
            />

            <InfoItem
              icon={<Wallet />}
              label="Budget"
              value={`${trip.currency ?? "₹"}${trip.budget.toLocaleString()}`}
            />

            <InfoItem
              icon={<MapPin />}
              label="Destination"
              value={trip.destination}
            />

          </div>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[550px] rounded-2xl overflow-hidden border border-border shadow-sm">
                <WorldMap trip={farhanTrip} cities={cities} />
              </div>
              <div className="flex flex-col gap-6 max-h-[550px] overflow-y-auto pr-1">
                <CitySearch />
                <ItineraryBuilder />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <TripTimeline />
              <BudgetDashboard />
            </div>
          </div>

        </CardContent>

      </Card>

    </main>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="size-4 [&>svg]:size-4">
          {icon}
        </span>

        <span className="text-sm">
          {label}
        </span>
      </div>

      <p className="mt-2 font-medium">
        {value}
      </p>
    </div>
  )
}

export default TripDetails