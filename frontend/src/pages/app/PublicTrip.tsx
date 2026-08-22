import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { MapPin, CalendarDays, Clock, Globe, ArrowLeft, User as UserIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiService } from "@/services/api"
import type { Trip } from "@/types/trip"
import { ErrorState } from "@/components/travel/ErrorState"

export function PublicTrip() {
  const { slug } = useParams()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!slug) return

    async function loadPublicTrip(shareSlug: string) {
      try {
        setLoading(true)
        const data = await apiService.getSharedTrip(shareSlug)
        setTrip(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Public trip not found or link has expired."
        )
      } finally {
        setLoading(false)
      }
    }

    loadPublicTrip(slug)
  }, [slug])

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
        Loading shared trip...
      </main>
    )
  }

  if (error || !trip) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title="Shared Trip Unavailable"
          description={error || "This trip does not exist or is private."}
          onRetry={() => window.location.reload()}
        />
      </main>
    )
  }

  const tripName = trip.name || trip.title || "Shared Trip"
  const coverImage = trip.cover_image_url || trip.cover_photo_url || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200"

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Banner */}
      <header className="border-b bg-card px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-heading font-bold text-lg text-primary">
          <Globe className="size-5" />
          <span>GlobeTrotter Shared Itinerary</span>
        </div>
        <Link to="/login">
          <Button variant="outline" size="sm">
            Sign In / Join GlobeTrotter
          </Button>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to GlobeTrotter
        </Link>

        {/* Hero Card */}
        <Card className="overflow-hidden">
          <div className="relative h-64 w-full bg-slate-900">
            <img
              src={coverImage}
              alt={tripName}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <Badge variant="secondary" className="mb-2">
                Public Shared Trip
              </Badge>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {tripName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {trip.destination}
              </p>
            </div>
          </div>

          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase">
                  <CalendarDays className="size-4" /> Dates
                </div>
                <p className="mt-2 font-semibold text-base">
                  {trip.start_date || "Flexible"} — {trip.end_date || "Flexible"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase">
                  <Clock className="size-4" /> Duration
                </div>
                <p className="mt-2 font-semibold text-base">
                  {trip.duration_days || 1} Days
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase">
                  <UserIcon className="size-4" /> Shared By
                </div>
                <p className="mt-2 font-semibold text-base">
                  {(trip as any).creator || "GlobeTrotter Explorer"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itinerary */}
        <section className="space-y-6">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Shared Itinerary
          </h2>

          {trip.stops && trip.stops.length > 0 ? (
            <div className="space-y-6">
              {trip.stops.map((stop, sIdx) => (
                <Card key={stop.id || sIdx} className="p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b pb-3">
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

                  <div className="space-y-3">
                    {stop.activities && stop.activities.length > 0 ? (
                      stop.activities.map((act, aIdx) => (
                        <div key={act.id || aIdx} className="rounded-xl border p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="uppercase text-[10px]">
                                Day {act.day_number} · {act.category}
                              </Badge>
                              <h4 className="font-semibold text-base">{act.title || act.name}</h4>
                            </div>
                            <span className="text-sm font-semibold text-emerald-600">
                              {act.cost > 0 ? `${trip.currency || '₹'} ${act.cost.toLocaleString()}` : 'Free'}
                            </span>
                          </div>

                          {act.description && (
                            <p className="text-sm text-muted-foreground">{act.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No activities listed for this stop.</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No stops available in this shared itinerary.
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}

export default PublicTrip
