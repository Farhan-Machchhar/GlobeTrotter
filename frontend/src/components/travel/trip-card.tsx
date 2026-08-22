import {
  CalendarDays,
  MapPin,
  MoreHorizontal,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TripCardProps {
  title: string
  location: string
  date: string
  destinations?: number
  status?: "upcoming" | "ongoing" | "completed"
  image?: string
  className?: string
  onViewTrip?: () => void
  onMore?: () => void
}

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    variant: "secondary" as const,
  },
  ongoing: {
    label: "Ongoing",
    variant: "default" as const,
  },
  completed: {
    label: "Completed",
    variant: "outline" as const,
  },
}

function TripCard({
  title,
  location,
  date,
  destinations,
  status = "upcoming",
  image,
  className,
  onViewTrip,
  onMore,
}: TripCardProps) {
  const statusInfo = statusConfig[status]

  return (
    <Card
      className={cn(
        "group w-full overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      {/* Image */}

      {image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={image}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          <Badge
            variant={statusInfo.variant}
            className="absolute left-4 bottom-4"
          >
            {statusInfo.label}
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More options for ${title}`}
            onClick={onMore}
          >
            <MoreHorizontal />
          </Button>
        </CardAction>

        <CardTitle>{title}</CardTitle>

        <CardDescription className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          {location}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">

          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {date}
          </span>

          {destinations !== undefined && (
            <span>
              {destinations}{" "}
              {destinations === 1 ? "destination" : "destinations"}
            </span>
          )}

        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={onViewTrip}
        >
          View Trip
        </Button>
      </CardFooter>
    </Card>
  )
}

export { TripCard }