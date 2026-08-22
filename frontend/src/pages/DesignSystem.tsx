import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { Search, Heart, MoreHorizontal, Plus, Settings, } from "lucide-react"
import { AppHeader } from "@/components/layout/app-header"

export default function DesignSystem() {
    return (
        <main className="min-h-screen bg-background px-6 py-12 text-foreground">
            <div className="mx-auto max-w-6xl space-y-16">

                {/* Header */}
                <section className="space-y-4">
                    <p className="text-sm font-medium tracking-wide text-travel-blue">
                        GLOBETROTTER DESIGN SYSTEM
                    </p>

                    <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                        Apple-inspired.
                        <br />
                        Built for travel.
                    </h1>

                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        A clean, premium travel-planning interface inspired by Apple's
                        attention to typography, spacing, motion and simplicity.
                    </p>
                </section>


                {/* Colors */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Colors
                        </h2>

                        <p className="mt-2 text-muted-foreground">
                            GlobeTrotter's core travel palette.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <ColorCard
                            name="Ocean Blue"
                            variable="travel-blue"
                            className="bg-travel-blue"
                            textClass="text-white"
                        />

                        <ColorCard
                            name="Sunset Coral"
                            variable="travel-coral"
                            className="bg-travel-coral"
                            textClass="text-white"
                        />

                        <ColorCard
                            name="Travel Green"
                            variable="travel-green"
                            className="bg-travel-green"
                            textClass="text-white"
                        />

                        <ColorCard
                            name="Cloud Background"
                            variable="background"
                            className="bg-background border"
                            textClass="text-foreground"
                        />

                    </div>
                </section>


                {/* Typography */}
                <section className="space-y-10">

                    <div>
                        <h2 className="type-h2">
                            Typography
                        </h2>

                        <p className="mt-2 type-body text-muted-foreground">
                            Geist Variable with a carefully controlled hierarchy.
                        </p>
                    </div>


                    <div className="space-y-10">

                        {/* Display */}

                        <div className="space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                Display · 56px · Semibold
                            </p>

                            <h1 className="type-display">
                                Where will you go next?
                            </h1>

                        </div>


                        {/* H1 */}

                        <div className="space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                H1 · 44px · Semibold
                            </p>

                            <h2 className="type-h1">
                                Your next adventure
                            </h2>

                        </div>


                        {/* H2 */}

                        <div className="space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                H2 · 32px · Semibold
                            </p>

                            <h3 className="type-h2">
                                Upcoming trips
                            </h3>

                        </div>


                        {/* H3 */}

                        <div className="space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                H3 · 24px · Semibold
                            </p>

                            <h4 className="type-h3">
                                Kyoto, Japan
                            </h4>

                        </div>


                        {/* Body Large */}

                        <div className="max-w-2xl space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                Body Large · 18px
                            </p>

                            <p className="type-body-lg">
                                Discover beautiful destinations, build thoughtful itineraries,
                                and plan every part of your journey in one place.
                            </p>

                        </div>


                        {/* Body */}

                        <div className="max-w-2xl space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                Body · 16px
                            </p>

                            <p className="type-body text-muted-foreground">
                                GlobeTrotter helps you organize destinations, activities,
                                budgets and travel plans without making the experience feel
                                complicated.
                            </p>

                        </div>


                        {/* Small */}

                        <div className="space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                Body Small · 14px
                            </p>

                            <p className="type-body-sm text-muted-foreground">
                                5 days · 4 nights · 3 activities
                            </p>

                        </div>


                        {/* Label */}

                        <div className="space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                Label · 14px · Medium
                            </p>

                            <p className="type-label">
                                CREATE NEW TRIP
                            </p>

                        </div>


                        {/* Caption */}

                        <div className="space-y-3">

                            <p className="type-caption uppercase text-muted-foreground">
                                Caption · 12px · Medium
                            </p>

                            <p className="type-caption text-muted-foreground">
                                Updated 2 minutes ago
                            </p>

                        </div>

                    </div>

                </section>

                <section className="space-y-8">
                    <div>
                        <h2 className="type-h2">
                            App Header
                        </h2>

                        <p className="mt-2 type-body text-muted-foreground">
                            Global navigation for the GlobeTrotter experience.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border">
                        <AppHeader currentPath="/dashboard" />
                    </div>
                </section>

                {/* Avatars */}
                <section className="space-y-8">
                    <div>
                        <h2 className="type-h2">
                            Avatars
                        </h2>

                        <p className="mt-2 type-body text-muted-foreground">
                            Circular profile images for users, groups, and destinations.
                        </p>
                    </div>

                    {/* Image */}
                    <Avatar>
                        <AvatarImage
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                            alt="Kavya"
                        />
                        <AvatarFallback>KP</AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-4">
                        <Avatar size="sm">
                            <AvatarFallback>KP</AvatarFallback>
                        </Avatar>

                        <Avatar>
                            <AvatarFallback>KP</AvatarFallback>
                        </Avatar>

                        <Avatar size="lg">
                            <AvatarFallback>KP</AvatarFallback>
                        </Avatar>
                    </div>

                    <AvatarGroup>
                        <Avatar>
                            <AvatarFallback>KP</AvatarFallback>
                        </Avatar>

                        <Avatar>
                            <AvatarFallback>AS</AvatarFallback>
                        </Avatar>

                        <Avatar>
                            <AvatarFallback>RM</AvatarFallback>
                        </Avatar>

                        <AvatarGroupCount>
                            +3
                        </AvatarGroupCount>
                    </AvatarGroup>
                </section>

                {/* Badges */}
                <section className="space-y-8">

                    <div>
                        <h2 className="type-h2">
                            Badges
                        </h2>

                        <p className="mt-2 type-body text-muted-foreground">
                            Small, subtle labels for status, categories, and tags.
                        </p>
                    </div>
                    {/* Primary */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge>Popular</Badge>
                        <Badge>Recommended</Badge>
                    </div>

                    {/* Secondary */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary">
                            7 Days
                        </Badge>

                        <Badge variant="secondary">
                            5 Destinations
                        </Badge>
                    </div>

                    {/* Outline */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline">
                            Japan
                        </Badge>

                        <Badge variant="outline">
                            Culture
                        </Badge>

                        <Badge variant="outline">
                            Food
                        </Badge>
                    </div>

                    {/* Destructive */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="destructive">
                            Over Budget
                        </Badge>
                    </div>

                    {/* Ghost */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="ghost">
                            Upcoming
                        </Badge>
                    </div>
                </section>

                {/* Buttons */}
                <section className="space-y-8">

                    <div>
                        <h2 className="type-h2">
                            Buttons
                        </h2>

                        <p className="mt-2 type-body text-muted-foreground">
                            Simple, confident actions with subtle interaction.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            aria-label="Save trip"
                        >
                            <Heart />
                        </Button>

                        <Button>
                            Create Trip
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button size="icon" aria-label="Search">
                            <Search />
                        </Button>

                        <Button size="icon" variant="outline" aria-label="Settings">
                            <Settings />
                        </Button>

                        <Button size="icon" variant="ghost" aria-label="More options">
                            <MoreHorizontal />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button size="icon-xs" variant="outline" aria-label="Add">
                            <Plus />
                        </Button>

                        <Button size="icon-sm" variant="outline" aria-label="Add">
                            <Plus />
                        </Button>

                        <Button size="icon" variant="outline" aria-label="Add">
                            <Plus />
                        </Button>

                        <Button size="icon-lg" variant="outline" aria-label="Add">
                            <Plus />
                        </Button>
                    </div>


                    {/* Variants */}

                    <div className="space-y-4">

                        <p className="type-label text-muted-foreground">
                            VARIANTS
                        </p>

                        <div className="flex flex-wrap items-center gap-3">

                            <Button>
                                Create Trip
                            </Button>

                            <Button variant="secondary">
                                Explore
                            </Button>

                            <Button variant="outline">
                                View Details
                            </Button>

                            <Button variant="ghost">
                                Cancel
                            </Button>

                            <Button variant="destructive">
                                Delete Trip
                            </Button>

                            <Button variant="link">
                                Learn More
                            </Button>

                        </div>

                    </div>


                    {/* Sizes */}

                    <div className="space-y-4">

                        <p className="type-label text-muted-foreground">
                            SIZES
                        </p>

                        <div className="flex flex-wrap items-center gap-3">

                            <Button size="xs">
                                Extra Small
                            </Button>

                            <Button size="sm">
                                Small
                            </Button>

                            <Button>
                                Default
                            </Button>

                            <Button size="lg">
                                Start Planning
                            </Button>

                        </div>

                    </div>


                    {/* Icon Buttons */}

                    <div className="space-y-4">

                        <p className="type-label text-muted-foreground">
                            ICON BUTTONS
                        </p>

                        <div className="flex items-center gap-3">

                            <Button
                                size="icon-xs"
                                aria-label="Add"
                            >
                                +
                            </Button>

                            <Button
                                size="icon-sm"
                                aria-label="Add"
                            >
                                +
                            </Button>

                            <Button
                                size="icon"
                                aria-label="Add"
                            >
                                +
                            </Button>

                            <Button
                                size="icon-lg"
                                aria-label="Add"
                            >
                                +
                            </Button>

                        </div>

                    </div>


                    {/* States */}

                    <div className="space-y-4">

                        <p className="type-label text-muted-foreground">
                            STATES
                        </p>

                        <div className="flex flex-wrap items-center gap-3">

                            <Button>
                                Normal
                            </Button>

                            <Button disabled>
                                Disabled
                            </Button>

                            <Button variant="outline" disabled>
                                Disabled Outline
                            </Button>

                        </div>

                    </div>

                </section>

                {/* Inputs */}
                <section className="space-y-8">

                    <div>
                        <h2 className="type-h2">
                            Inputs
                        </h2>

                        <p className="mt-2 type-body text-muted-foreground">
                            Clear, spacious fields designed for effortless trip planning.
                        </p>
                    </div>


                    {/* Basic */}

                    <div className="max-w-md space-y-3">

                        <p className="type-label text-muted-foreground">
                            DEFAULT
                        </p>

                        <Input
                            placeholder="Search destinations..."
                        />

                    </div>


                    {/* Filled */}

                    <div className="max-w-md space-y-3">

                        <p className="type-label text-muted-foreground">
                            FILLED
                        </p>

                        <Input
                            value="Kyoto, Japan"
                            readOnly
                        />

                    </div>


                    {/* Disabled */}

                    <div className="max-w-md space-y-3">

                        <p className="type-label text-muted-foreground">
                            DISABLED
                        </p>

                        <Input
                            placeholder="Trip destination"
                            disabled
                        />

                    </div>


                    {/* Invalid */}

                    <div className="max-w-md space-y-3">

                        <p className="type-label text-muted-foreground">
                            INVALID
                        </p>

                        <Input
                            value="Invalid destination"
                            readOnly
                            aria-invalid="true"
                        />

                        <p className="type-caption text-destructive">
                            Please enter a valid destination.
                        </p>

                    </div>

                </section>

                {/* Cards */}
                <section className="space-y-6">

                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Cards
                        </h2>

                        <p className="mt-2 text-muted-foreground">
                            Soft surfaces with generous spacing.
                        </p>
                    </div>

                    <Card className="max-w-md">
                        <CardHeader>
                            <CardAction>
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label="More trip options"
                                >
                                    <MoreHorizontal />
                                </Button>
                            </CardAction>

                            <CardTitle>
                                Japan Adventure
                            </CardTitle>

                            <CardDescription>
                                Tokyo · Kyoto · Osaka
                            </CardDescription>
                        </CardHeader>
                    </Card>



                    <Card className="max-w-md">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>KP</AvatarFallback>
                                </Avatar>

                                <div>
                                    <CardTitle>Kavya's Japan Trip</CardTitle>

                                    <CardDescription>
                                        Shared with 3 travelers
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <AvatarGroup>
                                <Avatar>
                                    <AvatarFallback>KP</AvatarFallback>
                                </Avatar>

                                <Avatar>
                                    <AvatarFallback>AS</AvatarFallback>
                                </Avatar>

                                <Avatar>
                                    <AvatarFallback>RM</AvatarFallback>
                                </Avatar>

                                <AvatarGroupCount>
                                    +2
                                </AvatarGroupCount>
                            </AvatarGroup>
                        </CardContent>
                    </Card>

                    <Card className="max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <Badge>
                                    Popular
                                </Badge>

                                <Badge variant="secondary">
                                    7 Days
                                </Badge>
                            </div>

                            <CardTitle className="mt-2">
                                Japan Adventure
                            </CardTitle>

                            <CardDescription>
                                Tokyo · Kyoto · Osaka
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Explore temples, food, culture, and modern city life.
                            </p>
                        </CardContent>

                        <CardFooter>
                            <Button size="sm">
                                View Trip
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>Japan Adventure</CardTitle>

                            <CardDescription>
                                12 Sep — 18 Sep · 7 days
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Tokyo, Kyoto, Osaka, and Nara.
                            </p>
                        </CardContent>

                        <CardFooter>
                            <Button size="sm">
                                View Trip
                            </Button>
                        </CardFooter>
                    </Card>



                    <Card className="max-w-md">
                        <img
                            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"
                            alt="Kyoto, Japan"
                            className="h-48 w-full object-cover"
                        />

                        <CardHeader>
                            <CardTitle>Kyoto, Japan</CardTitle>

                            <CardDescription>
                                Temples, gardens, and traditional streets.
                            </CardDescription>
                        </CardHeader>

                        <CardFooter>
                            <Button variant="ghost" size="sm">
                                Explore
                            </Button>
                        </CardFooter>
                    </Card>



                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>Upcoming Trip</CardTitle>

                            <CardAction>
                                <Button variant="ghost" size="icon">
                                    ⋯
                                </Button>
                            </CardAction>

                            <CardDescription>
                                Japan · September 2026
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm">
                                7 days · 5 destinations
                            </p>
                        </CardContent>
                    </Card>
                </section>


                {/* Glass */}
                <section className="space-y-6">

                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Glass Surface
                        </h2>

                        <p className="mt-2 text-muted-foreground">
                            Used selectively for floating navigation and contextual controls.
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-12">

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_30%)]" />

                        <div className="glass relative mx-auto max-w-3xl rounded-2xl p-6 text-white">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-white/70">
                                        CURRENT DESTINATION
                                    </p>

                                    <h3 className="mt-1 text-2xl font-semibold">
                                        Kyoto, Japan
                                    </h3>
                                </div>

                                <Button variant="secondary">
                                    View Trip
                                </Button>

                            </div>

                        </div>

                    </div>
                </section>


                {/* Spacing */}
                <section className="space-y-6 pb-12">

                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Spacing & Shape
                        </h2>

                        <p className="mt-2 text-muted-foreground">
                            Generous whitespace creates the premium Apple-like feeling.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">

                        <SpacingBox size="Small" className="h-16" />

                        <SpacingBox size="Medium" className="h-24" />

                        <SpacingBox size="Large" className="h-32" />

                    </div>

                </section>

            </div>
        </main>
    )
}


/* =========================================================
   Small Preview Components
   ========================================================= */

function ColorCard({
    name,
    variable,
    className,
    textClass,
}: {
    name: string
    variable: string
    className: string
    textClass: string
}) {
    return (
        <div
            className={`flex h-36 flex-col justify-end rounded-3xl p-5 ${className}`}
        >
            <p className={`font-semibold ${textClass}`}>
                {name}
            </p>

            <p className={`mt-1 text-sm opacity-70 ${textClass}`}>
                --{variable}
            </p>
        </div>
    )
}


function SpacingBox({
    size,
    className,
}: {
    size: string
    className: string
}) {
    return (
        <div
            className={`flex items-center justify-center rounded-3xl bg-card shadow-soft ${className}`}
        >
            <span className="text-sm font-medium text-muted-foreground">
                {size} spacing
            </span>
        </div>
    )
}