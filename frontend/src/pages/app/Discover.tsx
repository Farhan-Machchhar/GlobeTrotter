import { useEffect, useState } from "react"
import {
  Compass,
  MapPin,
  Search,
  Star,
  SlidersHorizontal,
  Plus,
  Clock3,
  Wallet,
  Loader2,
} from "lucide-react"

import { PageContainer } from "@/components/travel/page-container"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddToTripDialog } from "@/components/travel/AddToTripDialog"
import { apiService, apiClient } from "@/services/api"
import type { CitySearchResult, Activity } from "@/types/trip"

export function Discover() {
  const [search, setSearch] = useState("")
  const [region, setRegion] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState("")
  const [selectedType, setSelectedType] = useState<"destination" | "activity">("destination")

  const [cities, setCities] = useState<CitySearchResult[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch live cities and activities from backend
  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      setLoading(true)
      try {
        const [cityRes, actRes] = await Promise.all([
          apiService.searchCities(search),
          apiClient.get<Activity[]>("/activities", { params: { q: search } }).then(r => r.data).catch(() => [])
        ])

        if (isMounted) {
          setCities(cityRes)
          setActivities(actRes)
        }
      } catch (err) {
        console.error("Error fetching discover data:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const timer = setTimeout(fetchData, 300)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [search])

  const handleAddToTrip = (name: string, type: "destination" | "activity" = "destination") => {
    setSelectedItem(name)
    setSelectedType(type)
    setDialogOpen(true)
  }

  const filteredDestinations = cities.filter((city) => {
    const matchesRegion = region === "All" || (city.region && city.region === region)
    return matchesRegion
  })

  return (
    <PageContainer>
      {/* Header */}
      <section className="mb-8">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Compass className="size-5" />
          </div>

          <div>
            <h1 className="type-h1">
              Discover
            </h1>

            <p className="mt-2 type-body text-muted-foreground">
              Find destinations, experiences and inspiration for your next adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar & Filters */}
      <Card className="mb-8">
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search destinations, cities or activities..."
              className="h-11 pl-10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Button variant="default" size="sm">
                All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSearch("Japan")}>
                Asia
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSearch("Europe")}>
                Europe
              </Button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />

              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none"
              >
                <option value="All">All regions</option>
                <option value="Kanto">Kanto</option>
                <option value="Kansai">Kansai</option>
                <option value="Catalonia">Catalonia</option>
                <option value="Île-de-France">Île-de-France</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destinations Section */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="type-h2">
              Popular destinations
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Places worth adding to your next trip.
            </p>
          </div>

          <span className="hidden text-sm text-muted-foreground sm:block">
            {filteredDestinations.length} destinations
          </span>
        </div>

        {loading ? (
          <div className="flex py-12 justify-center items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading destinations...
          </div>
        ) : filteredDestinations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-center">
              <Search className="mb-3 size-8 text-muted-foreground" />

              <h3 className="font-heading font-medium">
                No destinations found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try another search term to discover more places.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("")
                  setRegion("All")
                }}
              >
                Clear search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((city) => (
              <Card
                key={city.id}
                className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={city.image_url || city.cover_image_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800"}
                    alt={city.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                    {city.popularity_score ? `${city.popularity_score}% Popular` : "Popular"}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading font-semibold text-lg">
                        {city.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {city.country}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star className="size-3.5 fill-current" />
                      {city.cost_index ? `${city.cost_index}/10` : "4.8"}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {city.description || `Explore ${city.name}, ${city.country}.`}
                  </p>

                  <Button
                    onClick={() => handleAddToTrip(city.name, "destination")}
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    <Plus className="size-4" />
                    Add to trip
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Activities Section */}
      <section className="mt-12">
        <div className="mb-4">
          <h2 className="type-h2">
            Featured Activities
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Top-rated experiences from our travel catalogue.
          </p>
        </div>

        {activities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No matching activities found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((act) => (
              <Card
                key={act.id}
                className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                  <img
                    src={(act as any).image_url || "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800"}
                    alt={act.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {act.category}
                      </p>

                      <h3 className="mt-1 font-heading font-semibold">
                        {act.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star className="size-3.5 fill-current" />
                      {(act as any).rating || "4.8"}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {act.duration_mins} mins
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Wallet className="size-3.5" />
                      {act.cost > 0 ? `₹${act.cost.toLocaleString()}` : "Free"}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleAddToTrip(act.title, "activity")}
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    <Plus className="size-4" />
                    Add activity
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AddToTripDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        itemName={selectedItem}
        itemType={selectedType}
      />
    </PageContainer>
  )
}

export default Discover