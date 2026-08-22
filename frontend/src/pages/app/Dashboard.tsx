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
                        <span className="inline-block animate-bounce">👋</span>
                    </h1>

                    <p className="mt-3 text-lg text-muted-foreground">
                        Ready to design your next epic adventure? Let AI craft your itinerary or build one manually.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link to="/create-trip">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                            <Plus className="size-5" />
                            Plan New Trip
                        </Button>
                    </Link>
                </div>
            </section>

            {/* AI Trip Planner Quick Bar */}
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-950 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-sky-400">
                            <Sparkles className="size-4 text-amber-400" />
                            Gemini 2.5 AI Travel Concierge
                        </div>
                        <h2 className="text-xl font-bold">Where would you like to travel?</h2>
                        <p className="text-sm text-muted-foreground">
                            Type any destination or trip dream to generate an interactive map & itinerary instantly.
                        </p>
                    </div>

                    <form onSubmit={handleAIPromptSubmit} className="flex w-full gap-2 md:w-auto md:min-w-[400px]">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. 4-day trip to Goa beaches under ₹30,000"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <Button type="submit" disabled={isGenerating} className="shrink-0 gap-2">
                            {isGenerating ? <Sparkles className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                            Plan
                        </Button>
                    </form>
                </div>
            </Card>

            {/* Overview Quick Stats Grid */}
            <section className="grid gap-6 sm:grid-cols-3">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                            <Map className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Trips</p>
                            <h3 className="type-h2 font-heading text-2xl font-bold">{trips.length}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <Compass className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Cities Visited</p>
                            <h3 className="type-h2 font-heading text-2xl font-bold">
                                {trips.reduce((acc, t) => acc + (t.stops?.length || t.destination_count || 1), 0)}
                            </h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                            <Wallet className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Budget Allocated</p>
                            <h3 className="type-h2 font-heading text-2xl font-bold">
                                ₹{totalBudget.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Upcoming Trips */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="type-h2 font-heading text-2xl font-bold">Your Upcoming Trips</h2>
                        <p className="text-sm text-muted-foreground">Your active multi-city travel itineraries.</p>
                    </div>

                    <Link to="/my-trips">
                        <Button variant="ghost" size="sm" className="gap-2">
                            View all ({trips.length})
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
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="type-h2 font-heading text-2xl font-bold">Popular Destinations</h2>
                        <p className="text-sm text-muted-foreground">Explore curated cities for your next getaway.</p>
                    </div>

                    <Link to="/discover">
                        <Button variant="ghost" size="sm" className="gap-2">
                            Explore all
                            <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    {destinations.map((dest) => (
                        <Card key={dest.id} className="group overflow-hidden">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={dest.image_url || dest.cover_image_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800"}
                                    alt={dest.name}
                                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="type-h3 font-heading text-lg font-bold">{dest.name}</h3>
                                    <p className="text-xs opacity-90">{dest.country}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

        </PageContainer>
    )
}

export default Dashboard