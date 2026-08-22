import { useMemo, useState } from "react"
import {
  Compass,
  MapPin,
  Search,
  Star,
  SlidersHorizontal,
  Plus,
  Clock3,
  Wallet,
} from "lucide-react"

import { PageContainer } from "@/components/travel/page-container"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddToTripDialog } from "@/components/travel/AddToTripDialog"

type Destination = {
  id: number
  name: string
  country: string
  region: string
  image: string
  rating: number
  cost: "Low" | "Medium" | "High"
  description: string
}

type Activity = {
  id: number
  name: string
  city: string
  category: string
  image: string
  duration: string
  cost: "Low" | "Medium" | "High"
  rating: number
}

const destinations: Destination[] = [
  {
    id: 1,
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    cost: "Medium",
    description: "Neon streets, timeless temples and incredible food.",
  },
  {
    id: 2,
    name: "Paris",
    country: "France",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    cost: "High",
    description: "Art, architecture, cafés and unforgettable city walks.",
  },
  {
    id: 3,
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    cost: "Low",
    description: "Tropical beaches, nature and peaceful escapes.",
  },
  {
    id: 4,
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    cost: "High",
    description: "Modern architecture, desert adventures and luxury.",
  },
  {
    id: 5,
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    cost: "Medium",
    description: "Traditional Japan, temples and beautiful gardens.",
  },
  {
    id: 6,
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    cost: "Medium",
    description: "Gaudí architecture, beaches and vibrant streets.",
  },
]

const activities: Activity[] = [
  {
    id: 1,
    name: "Sushi Making Experience",
    city: "Tokyo",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80",
    duration: "2 hours",
    cost: "Medium",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Fushimi Inari Walk",
    city: "Kyoto",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=900&q=80",
    duration: "3 hours",
    cost: "Low",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Bali Beach Day",
    city: "Bali",
    category: "Nature",
    image:
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=900&q=80",
    duration: "5 hours",
    cost: "Medium",
    rating: 4.9,
  },
]

function Discover() {
  const [search, setSearch] = useState("")
  const [region, setRegion] = useState("All")
  const [cost, setCost] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState("")

  const handleAddToTrip = (name: string) => {
    setSelectedItem(name)
    setDialogOpen(true)
  }

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return destinations.filter((destination) => {
      const matchesSearch =
        !query ||
        destination.name.toLowerCase().includes(query) ||
        destination.country.toLowerCase().includes(query)

      const matchesRegion =
        region === "All" || destination.region === region

      const matchesCost =
        cost === "All" || destination.cost === cost

      return matchesSearch && matchesRegion && matchesCost
    })
  }, [search, region, cost])

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return activities

    return activities.filter(
      (activity) =>
        activity.name.toLowerCase().includes(query) ||
        activity.city.toLowerCase().includes(query) ||
        activity.category.toLowerCase().includes(query)
    )
  }, [search])

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

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="space-y-4">
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
              <Button
                variant="default"
                size="sm"
              >
                All
              </Button>

              <Button
                variant="outline"
                size="sm"
              >
                Cities
              </Button>

              <Button
                variant="outline"
                size="sm"
              >
                Activities
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
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Middle East">Middle East</option>
              </select>

              <select
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none"
              >
                <option value="All">All costs</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destinations */}
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

        {filteredDestinations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-center">
              <Search className="mb-3 size-8 text-muted-foreground" />

              <h3 className="font-heading font-medium">
                No destinations found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try another search or clear your filters to discover more places.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("")
                  setRegion("All")
                  setCost("All")
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                    {destination.cost} cost
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading font-semibold">
                        {destination.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {destination.country}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm">
                      <Star className="size-3.5 fill-current" />
                      {destination.rating}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {destination.description}
                  </p>

                  <Button
                    onClick={() => handleAddToTrip(destination.name)}
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

      {/* Activities */}
      <section className="mt-12">
        <div className="mb-4">
          <h2 className="type-h2">
            Things to do
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Experiences to make your journey memorable.
          </p>
        </div>

        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No activities found for your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-primary">
                        {activity.category}
                      </p>

                      <h3 className="mt-1 font-heading font-semibold">
                        {activity.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {activity.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-sm">
                      <Star className="size-3.5 fill-current" />
                      {activity.rating}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {activity.duration}
                    </span>

                    <span className="flex items-center gap-1">
                      <Wallet className="size-3.5" />
                      {activity.cost}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleAddToTrip(activity.name)}
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
      />
    </PageContainer>
  )
}

export default Discover