import { ArrowRight, Compass, Map, Plus, Wallet } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageContainer } from "@/components/travel/page-container"

import { mockDashboard } from "@/data/mockDashboard"

function Dashboard() {
    const { user, upcomingTrips, destinations, budget } = mockDashboard

    const budgetPercentage = Math.round(
        (budget.spent / budget.total) * 100
    )

    return (
        <PageContainer className="space-y-12">

            {/* Hero */}

            <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

                <div className="max-w-2xl">

                    <p className="mb-2 text-sm font-medium text-primary">
                        YOUR JOURNEY STARTS HERE
                    </p>

                    <h1 className="type-h1">
                        Good morning, {user.name}{" "}
                        <span aria-hidden="true">👋</span>
                    </h1>

                    <p className="mt-3 max-w-xl type-body text-muted-foreground">
                        Ready to plan your next adventure?
                        Discover new places, organize your trips,
                        and keep everything in one place.
                    </p>

                </div>

                <Link
                    to="/create-trip"
                    className="inline-flex"
                >
                    <Button size="lg">
                        <Plus />
                        Plan New Trip
                    </Button>
                </Link>

            </section>


            {/* Quick Actions */}

            <section>

                <div className="mb-4">
                    <h2 className="type-h3">
                        Quick actions
                    </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">

                    <Link to="/create-trip" className="block">
                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start px-4 py-4"
                        >
                            <Map />
                            <span>Plan a trip</span>
                        </Button>
                    </Link>

                    <Link to="/discover" className="block">
                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start px-4 py-4"
                        >
                            <Compass />
                            <span>Explore destinations</span>
                        </Button>
                    </Link>

                    <Link to="/my-trips" className="block">
                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start px-4 py-4"
                        >
                            <Wallet />
                            <span>View my trips</span>
                        </Button>
                    </Link>

                </div>

            </section>


            {/* Upcoming Trips */}

            <section>

                <div className="mb-5 flex items-end justify-between">

                    <div>
                        <p className="mb-1 text-sm font-medium text-primary">
                            YOUR JOURNEYS
                        </p>

                        <h2 className="type-h2">
                            Upcoming trips
                        </h2>
                    </div>

                    <Link to="/my-trips" className="inline-flex">
                        <Button variant="ghost" size="sm">
                            View all
                            <ArrowRight />
                        </Button>
                    </Link>

                </div>


                <div className="grid gap-5 lg:grid-cols-2">

                    {upcomingTrips.map((trip) => (

                        <Card
                            key={trip.id}
                            className="overflow-hidden"
                        >

                            <div className="grid sm:grid-cols-[180px_1fr]">

                                <img
                                    src={trip.image}
                                    alt={trip.title}
                                    className="h-48 w-full object-cover sm:h-full"
                                />

                                <div className="flex flex-col justify-between p-5">

                                    <div>

                                        <Badge
                                            variant="secondary"
                                            className="mb-3"
                                        >
                                            Upcoming
                                        </Badge>

                                        <h3 className="type-h3">
                                            {trip.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {trip.location}
                                        </p>

                                        <p className="mt-4 text-sm font-medium">
                                            {trip.dates}
                                        </p>

                                    </div>

                                    <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">

                                        <span>
                                            {trip.duration} · {trip.destinations} destinations
                                        </span>

                                        <ArrowRight className="size-4" />

                                    </div>

                                </div>

                            </div>

                        </Card>

                    ))}

                </div>

            </section>


            {/* Destinations */}

            <section>

                <div className="mb-5 flex items-end justify-between">

                    <div>
                        <p className="mb-1 text-sm font-medium text-primary">
                            GET INSPIRED
                        </p>

                        <h2 className="type-h2">
                            Explore destinations
                        </h2>
                    </div>

                    <Link to="/discover" className="inline-flex">
                        <Button variant="ghost" size="sm">
                            Discover more
                            <ArrowRight />
                        </Button>
                    </Link>

                </div>


                <div className="grid gap-5 md:grid-cols-3">

                    {destinations.map((destination) => (

                        <Card
                            key={destination.id}
                            className="overflow-hidden"
                        >

                            <img
                                src={destination.image}
                                alt={destination.name}
                                className="aspect-[4/3] w-full object-cover"
                            />

                            <div className="p-5">

                                <div className="flex items-start justify-between gap-3">

                                    <div>
                                        <h3 className="type-h3">
                                            {destination.name}
                                        </h3>

                                        <p className="text-sm text-muted-foreground">
                                            {destination.country}
                                        </p>
                                    </div>

                                    <Badge variant="outline">
                                        {destination.costIndex}
                                    </Badge>

                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    {destination.description}
                                </p>

                                <p className="mt-4 text-xs font-medium text-muted-foreground">
                                    {destination.popularity}
                                </p>

                            </div>

                        </Card>

                    ))}

                </div>

            </section>


            {/* Budget */}

            <section>

                <div className="mb-5">

                    <p className="mb-1 text-sm font-medium text-primary">
                        TRIP OVERVIEW
                    </p>

                    <h2 className="type-h2">
                        Budget highlights
                    </h2>

                </div>


                <Card className="p-6">

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-sm text-muted-foreground">
                                Current trip spending
                            </p>

                            <div className="mt-1 flex items-baseline gap-2">

                                <span className="text-3xl font-semibold tracking-tight">
                                    ₹{budget.spent.toLocaleString("en-IN")}
                                </span>

                                <span className="text-sm text-muted-foreground">
                                    of ₹{budget.total.toLocaleString("en-IN")}
                                </span>

                            </div>

                        </div>

                        <Badge variant="secondary">
                            {budgetPercentage}% used
                        </Badge>

                    </div>


                    <div className="mt-6">

                        <div className="h-2 overflow-hidden rounded-full bg-muted">

                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${budgetPercentage}%` }}
                            />

                        </div>

                    </div>


                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">

                        {Object.entries(budget.categories).map(
                            ([category, amount]) => (

                                <div key={category}>

                                    <p className="text-xs capitalize text-muted-foreground">
                                        {category}
                                    </p>

                                    <p className="mt-1 text-sm font-semibold">
                                        ₹{amount.toLocaleString("en-IN")}
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                </Card>

            </section>

        </PageContainer>
    )
}

export default Dashboard