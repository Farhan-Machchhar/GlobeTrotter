import { useEffect, useState } from "react"
import { ArrowRight, CalendarDays, MapPin, Plus } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { getTrips } from "@/services/tripService"
import type { Trip } from "@/types/trip"
import { ErrorState } from "@/components/travel/ErrorState"

function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await getTrips()
        setTrips(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load trips."
        )
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            My Trips
          </h1>

          <p className="mt-2 text-muted-foreground">
            All your adventures in one place.
          </p>
        </div>

        <Link to="/create-trip">
          <Button className="w-full sm:w-auto">
            <Plus />
            Plan New Trip
          </Button>
        </Link>

      </div>

      {loading && (
        <div className="py-16 text-center text-muted-foreground">
          Loading your trips...
        </div>
      )}

      {error && (
        <ErrorState
          description={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && !error && trips.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">

            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <MapPin className="size-6 text-muted-foreground" />
            </div>

            <h2 className="font-heading text-xl font-semibold">
              No trips yet
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Start planning your first adventure and it'll appear here.
            </p>

            <Link
              to="/create-trip"
              className="mt-6"
            >
              <Button>
                <Plus />
                Plan your first trip
              </Button>
            </Link>

          </CardContent>
        </Card>
      )}

      {!loading && trips.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <CardTitle>
                      {trip.name}
                    </CardTitle>

                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {trip.destination}
                    </p>
                  </div>

                  {trip.status && (
                    <Badge variant="secondary">
                      {trip.status}
                    </Badge>
                  )}

                </div>

              </CardHeader>

              <CardContent>

                <div className="space-y-3 text-sm text-muted-foreground">

                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4" />
                    {trip.startDate} — {trip.endDate}
                  </div>

                  <div>
                    {trip.travelers}{" "}
                    {trip.travelers === 1
                      ? "traveler"
                      : "travelers"}
                  </div>

                  <div className="font-medium text-foreground">
                    {trip.currency ?? "₹"}
                    {trip.budget.toLocaleString()}
                  </div>

                </div>

                <Link
                  to={`/trip/${trip.id}`}
                  className="mt-5 block"
                >
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    View trip
                    <ArrowRight />
                  </Button>
                </Link>

              </CardContent>
            </Card>
          ))}

        </div>
      )}

    </main>
  )
}

export default MyTrips