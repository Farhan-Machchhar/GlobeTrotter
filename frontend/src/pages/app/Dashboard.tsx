import { useEffect, useState } from "react"
import { ArrowRight, Compass, Map, Plus, Wallet, Sparkles, MapPin } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageContainer } from "@/components/travel/page-container"
import { useAuthStore } from "@/store/authStore"
import { getTrips } from "@/services/tripService"
import { apiService } from "@/services/api"
import type { Trip, CitySearchResult } from "@/types/trip"

function Dashboard() {
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()

    const [trips, setTrips] = useState<Trip[]>([])
    const [destinations, setDestinations] = useState<CitySearchResult[]>([])
    const [loading, setLoading] = useState(true)
    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const [fetchedTrips, fetchedCities] = await Promise.all([
                    getTrips(),
                    apiService.searchCities(""),
                ])
                setTrips(fetchedTrips)
                setDestinations(fetchedCities.slice(0, 3))
            } catch (err) {
                console.error("Dashboard data load error:", err)
            } finally {
                setLoading(false)
            }
        }
        loadDashboardData()
    }, [])

    const handleAIPromptSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!prompt.trim()) return

        setIsGenerating(true)
        try {
            const savedTrip = await apiService.planAndSaveTrip({ prompt })
            navigate(`/trip/${savedTrip.id}`)
        } catch (err) {
            console.error("Failed to generate AI trip:", err)
            navigate("/create-trip")
        } finally {
            setIsGenerating(false)
        }
    }

    const userName = user?.name || user?.first_name || user?.email?.split("@")[0] || "Explorer"
    const totalBudget = trips.reduce((acc, t) => acc + (t.budget || t.total_budget || 0), 0)
    const totalSpent = trips.reduce((acc, t) => {
        const tripExpenses = t.expenses?.reduce((eAcc, e) => eAcc + e.amount, 0) || 0
        return acc + tripExpenses
    }, 0)
    const budgetPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 40

    return (
        <PageContainer className="space-y-12">

            {/* Hero Welcome */}
            <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-2 text-sm font-semibold tracking-wider text-primary">
                        YOUR JOURNEY STARTS HERE
                    </p>

                    <h1 className="type-h1 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Good day, {userName}{" "}
                        <span aria-hidden="true">👋</span>
                    </h1>

                    <p className="mt-3 max-w-xl type-body text-muted-foreground">
                        Ready to plan your next adventure?
                        Discover new places, organize your multi-city itineraries,
                        and keep everything in one place.
                    </p>
                </div>

                <Link to="/create-trip" className="inline-flex">
                    <Button size="lg" className="gap-2 shadow-lg">
                        <Plus className="size-5" />
                        Plan New Trip
                    </Button>
                </Link>
            </section>

            {/* AI Trip Planner Prompt Bar */}
            <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    <Sparkles className="size-4 animate-pulse text-amber-500" />
                    Gemini AI Trip Concierge
                </div>

                <h2 className="text-2xl font-bold font-heading sm:text-3xl mb-2">
                    Where would you like to go next?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Type a destination, budget, or interests and let AI craft your itinerary in seconds.
                </p>

                <form onSubmit={handleAIPromptSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Plan a 6-day Japan trip under ₹60,000 with anime & nature..."
                        className="flex-1 rounded-xl border border-border bg-background/90 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button type="submit" size="lg" disabled={isGenerating} className="gap-2 min-w-[150px]">
                        {isGenerating ? (
                            <>
                                <Sparkles className="size-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-4" />
                                Plan with AI
                            </>
                        )}
                    </Button>
                </form>
            </section>

            {/* Quick Actions */}
            <section>
                <div className="mb-4">
                    <h2 className="type-h3 font-heading font-bold text-xl">
                        Quick actions
                    </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Link to="/create-trip" className="block">
                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start px-4 py-4 gap-3 text-left font-medium"
                        >
                            <Map className="size-5 text-primary" />
                            <span>Plan a trip</span>
                        </Button>
                    </Link>

                    <Link to="/discover" className="block">
                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start px-4 py-4 gap-3 text-left font-medium"
                        >
                            <Compass className="size-5 text-primary" />
                            <span>Explore destinations</span>
                        </Button>
                    </Link>

                    <Link to="/my-trips" className="block">
                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start px-4 py-4 gap-3 text-left font-medium"
                        >
                            <Wallet className="size-5 text-primary" />
                            <span>View my trips</span>
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Upcoming Trips */}
            <section>
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <p className="mb-1 text-xs font-semibold text-primary uppercase tracking-wider">
                            YOUR JOURNEYS
                        </p>

                        <h2 className="type-h2 font-heading font-bold text-2xl">
                            Upcoming trips
                        </h2>
                    </div>

                    <Link to="/my-trips" className="inline-flex">
                        <Button variant="ghost" size="sm" className="gap-1">
                            View all
                            <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        Loading your trips...
                    </div>
                ) : trips.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Map className="size-10 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-heading font-semibold text-lg">No trips scheduled yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Start planning your first journey now.
                        </p>
                        <Link to="/create-trip">
                            <Button size="sm" className="gap-2">
                                <Plus className="size-4" />
                                Plan your first trip
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {trips.slice(0, 2).map((trip) => {
                            const tripName = trip.name || trip.title || "Untitled Trip"
                            const img = trip.cover_image_url || trip.cover_photo_url || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200"
                            const dates = `${trip.start_date || trip.startDate || "Flexible"} — ${trip.end_date || trip.endDate || "Flexible"}`
                            const stopCount = trip.stops?.length || trip.destination_count || 1

                            return (
                                <Card
                                    key={trip.id}
                                    className="overflow-hidden transition-all duration-200 hover:shadow-md"
                                >
                                    <div className="grid sm:grid-cols-[180px_1fr]">
                                        <img
                                            src={img}
                                            alt={tripName}
                                            className="h-48 w-full object-cover sm:h-full"
                                        />

                                        <div className="flex flex-col justify-between p-5">
                                            <div>
                                                <Badge variant="secondary" className="mb-3">
                                                    {trip.status || "Upcoming"}
                                                </Badge>

                                                <h3 className="type-h3 font-heading font-bold text-xl">
                                                    {tripName}
                                                </h3>

                                                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="size-3.5" />
                                                    {trip.destination}
                                                </p>

                                                <p className="mt-4 text-sm font-medium">
                                                    {dates}
                                                </p>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                                                <span>
                                                    {trip.duration_days} Days · {stopCount} Stop{stopCount === 1 ? "" : "s"}
                                                </span>

                                                <Link to={`/trip/${trip.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                                        Details
                                                        <ArrowRight className="size-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Featured Destinations */}
            <section>
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <p className="mb-1 text-xs font-semibold text-primary uppercase tracking-wider">
                            GET INSPIRED
                        </p>

                        <h2 className="type-h2 font-heading font-bold text-2xl">
                            Explore destinations
                        </h2>
                    </div>

                    <Link to="/discover" className="inline-flex">
                        <Button variant="ghost" size="sm" className="gap-1">
                            Discover more
                            <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {destinations.map((dest) => (
                        <Card key={dest.id} className="overflow-hidden group hover:shadow-md transition-all">
                            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900">
                                <img
                                    src={dest.image_url || dest.cover_image_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800"}
                                    alt={dest.name}
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="type-h3 font-heading font-bold text-lg">
                                            {dest.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {dest.country}
                                        </p>
                                    </div>

                                    <Badge variant="outline">
                                        {dest.cost_index ? `${dest.cost_index}/10 Cost` : "Top Rated"}
                                    </Badge>
                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                    {dest.description || `Experience the rich history and culture of ${dest.name}.`}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Budget Highlights */}
            <section>
                <div className="mb-5">
                    <p className="mb-1 text-xs font-semibold text-primary uppercase tracking-wider">
                        TRIP OVERVIEW
                    </p>

                    <h2 className="type-h2 font-heading font-bold text-2xl">
                        Budget highlights
                    </h2>
                </div>

                <Card className="p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total planned spending across active trips
                            </p>

                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight">
                                    ₹{totalSpent > 0 ? totalSpent.toLocaleString("en-IN") : "35,000"}
                                </span>

                                <span className="text-sm text-muted-foreground">
                                    of ₹{totalBudget > 0 ? totalBudget.toLocaleString("en-IN") : "60,000"}
                                </span>
                            </div>
                        </div>

                        <Badge variant="secondary" className="text-sm font-semibold">
                            {budgetPercentage}% used
                        </Badge>
                    </div>

                    <div className="mt-6">
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${budgetPercentage}%` }}
                            />
                        </div>
                    </div>
                </Card>
            </section>

        </PageContainer>
    )
}

export default Dashboard