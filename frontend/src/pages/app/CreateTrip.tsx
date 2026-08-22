import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Wallet,
} from "lucide-react"
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  createTrip,
  getTrip,
  updateTrip,
} from "@/services/tripService"

import { ErrorState } from "@/components/travel/ErrorState"

function CreateTrip() {
  const navigate = useNavigate()
  const { id } = useParams()

  const isEditMode = Boolean(id)

  const [name, setName] = useState("")
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [travelers, setTravelers] = useState("1")
  const [budget, setBudget] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Load existing trip when editing
  useEffect(() => {
    if (!id) return

    async function loadTrip() {
      if (!id) return

      try {
        setLoading(true)
        setError("")

        const trip = await getTrip(id)

        setName(trip.name)
        setDestination(trip.destination)
        setStartDate(trip.startDate)
        setEndDate(trip.endDate)
        setTravelers(String(trip.travelers))
        setBudget(String(trip.budget))
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

    loadTrip()
  }, [id])

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      // EDIT MODE
      if (isEditMode && id) {
        await updateTrip(id, {
          name,
          destination,
          startDate,
          endDate,
          travelers: Number(travelers),
          budget: Number(budget),
        })

        navigate(`/trip/${id}`)
      }

      // CREATE MODE
      else {
        const trip = await createTrip({
          name,
          destination,
          startDate,
          endDate,
          travelers: Number(travelers),
          budget: Number(budget),
        })

        navigate(`/trip/${trip.id}`)
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save trip."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">

        <Link
          to={isEditMode && id ? `/trip/${id}` : "/dashboard"}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />

          {isEditMode
            ? "Back to trip"
            : "Back to dashboard"}
        </Link>

        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {isEditMode
            ? "Edit trip"
            : "Plan a new trip"}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {isEditMode
            ? "Update your trip details."
            : "Tell us about your next adventure."}
        </p>

      </div>

      {/* Form Card */}
      <Card>

        <CardHeader>

          <CardTitle>
            {isEditMode
              ? "Edit trip details"
              : "Trip details"}
          </CardTitle>

          <CardDescription>
            {isEditMode
              ? "Update the details of your adventure."
              : "Add the basics and we'll take it from there."}
          </CardDescription>

        </CardHeader>

        <CardContent>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div className="grid gap-6 md:grid-cols-2">

              {/* Trip Name */}
              <div className="space-y-2 md:col-span-2">

                <label
                  htmlFor="trip-name"
                  className="text-sm font-medium"
                >
                  Trip name
                </label>

                <Input
                  id="trip-name"
                  placeholder="e.g. Japan Adventure"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

              </div>

              {/* Destination */}
              <div className="space-y-2 md:col-span-2">

                <label
                  htmlFor="destination"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <MapPin className="size-4" />
                  Destination
                </label>

                <Input
                  id="destination"
                  placeholder="e.g. Tokyo, Japan"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value)
                  }
                  required
                />

              </div>

              {/* Start Date */}
              <div className="space-y-2">

                <label
                  htmlFor="start-date"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <CalendarDays className="size-4" />
                  Start date
                </label>

                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  required
                />

              </div>

              {/* End Date */}
              <div className="space-y-2">

                <label
                  htmlFor="end-date"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <CalendarDays className="size-4" />
                  End date
                </label>

                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  min={startDate}
                  required
                />

              </div>

              {/* Travelers */}
              <div className="space-y-2">

                <label
                  htmlFor="travelers"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Users className="size-4" />
                  Travelers
                </label>

                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={travelers}
                  onChange={(event) =>
                    setTravelers(event.target.value)
                  }
                  required
                />

              </div>

              {/* Budget */}
              <div className="space-y-2">

                <label
                  htmlFor="budget"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Wallet className="size-4" />
                  Budget
                </label>

                <Input
                  id="budget"
                  type="number"
                  min="0"
                  placeholder="60000"
                  value={budget}
                  onChange={(event) =>
                    setBudget(event.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* Error */}
            {error && (
              <ErrorState
                description={error}
                onRetry={() => window.location.reload()}
              />
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">

              <Link
                to={
                  isEditMode && id
                    ? `/trip/${id}`
                    : "/dashboard"
                }
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading
                  ? isEditMode
                    ? "Saving changes..."
                    : "Creating trip..."
                  : isEditMode
                    ? "Save changes"
                    : "Create trip"}
              </Button>

            </div>

          </form>

        </CardContent>

      </Card>

    </main>
  )
}

export default CreateTrip