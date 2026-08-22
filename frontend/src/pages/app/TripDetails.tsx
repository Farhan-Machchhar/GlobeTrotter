import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  Users,
  Wallet,
  Share2,
  Clock,
  CheckCircle2,
  Globe,
  Sparkles,
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
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  deleteTrip,
  getTrip,
} from "@/services/tripService"
import { apiClient } from "@/services/api"
import type { Trip } from "@/types/trip"
import { ErrorState } from "@/components/travel/ErrorState"

function TripDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)

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

  async function handleShare() {
    if (!id) return
    try {
      const res = await apiClient.post(`/sharing/${id}/share`)
      const url = res.data.share_url || `${window.location.origin}/share/${res.data.slug}`
      setShareUrl(url)
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback share url
      const url = `${window.location.origin}/share/${trip?.share_slug || id}`
      setShareUrl(url)
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

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
        Loading trip details...
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

  const tripName = trip.name || trip.title || "Untitled Trip"
  const startDate = trip.start_date || trip.startDate || "Flexible"
  const endDate = trip.end_date || trip.endDate || "Flexible"
  const budgetVal = trip.budget || trip.total_budget || 0
  const currency = trip.currency || "₹"
  const coverImage = trip.cover_image_url || trip.cover_photo_url || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200"

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      <Link
        to="/my-trips"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my trips
      </Link>

      {/* Hero Header Card */}
      <Card className="overflow-hidden">
        <div className="relative h-64 w-full bg-slate-900">
          <img
            src={coverImage}
            alt={tripName}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {trip.status || "Planning"}
              </Badge>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {tripName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {trip.destination}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={handleShare}
              >
                {copied ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
                {copied ? "Link Copied!" : "Share Link"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => navigate(`/trip/${trip.id}/edit`)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {shareUrl && (
          <div className="bg-primary/10 border-t border-b border-primary/20 px-6 py-3 text-xs flex items-center justify-between">
            <span className="font-mono text-primary truncate">Public Link: {shareUrl}</span>
            <span className="text-emerald-500 font-semibold ml-2">Copied to clipboard!</span>
          </div>
        )}

        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <InfoItem
              icon={<CalendarDays />}
              label="Dates"
              value={`${startDate} — ${endDate}`}
            />

            <InfoItem
              icon={<Clock />}
              label="Duration"
              value={`${trip.duration_days || 5} Days`}
            />

            <InfoItem
              icon={<Wallet />}
              label="Budget"
              value={`${currency} ${budgetVal.toLocaleString()}`}
            />

            <InfoItem
              icon={<Users />}
              label="Travelers"
              value={`${trip.travelers || 1} Person`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Itinerary & Day-wise Activities */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Day-by-Day Itinerary
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/create-trip')}>
            <Sparkles className="size-4 mr-2 text-amber-500" />
            Add Destination / Stop
          </Button>
        </div>

        {trip.stops && trip.stops.length > 0 ? (
          <div className="space-y-6">
            {trip.stops.map((stop, sIdx) => (
              <Card key={stop.id || sIdx} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {sIdx + 1}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-xl">{stop.city_name}, {stop.country || ""}</h3>
                      <span className="text-xs text-muted-foreground">
                        {stop.activities?.length || 0} Planned Activities
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {stop.activities && stop.activities.length > 0 ? (
                    stop.activities.map((act, aIdx) => (
                      <div key={act.id || aIdx} className="rounded-xl border p-4 hover:border-primary/40 transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="uppercase text-[10px]">
                              Day {act.day_number} · {act.category}
                            </Badge>
                            <h4 className="font-semibold text-base">{act.title || act.name}</h4>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">
                            {act.cost > 0 ? `${currency} ${act.cost.toLocaleString()}` : 'Free'}
                          </span>
                        </div>

                        {act.description && (
                          <p className="text-sm text-muted-foreground">{act.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" /> {act.duration_mins} mins
                          </span>
                          {act.latitude && (
                            <span className="flex items-center gap-1 text-primary">
                              <MapPin className="size-3.5" /> Map Location ({act.latitude}, {act.longitude})
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic py-2">
                      No activities added for this stop yet.
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center space-y-3">
            <Globe className="size-10 text-muted-foreground mx-auto" />
            <h3 className="font-heading font-semibold text-lg">No destinations added yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Add cities and activities to your itinerary or use the Gemini AI planner to generate a full schedule.
            </p>
          </Card>
        )}
      </section>
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
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 font-semibold text-base text-foreground">
        {value}
      </p>
    </div>
  )
}

export default TripDetails