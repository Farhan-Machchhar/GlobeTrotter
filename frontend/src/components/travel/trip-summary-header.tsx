import {
  CalendarDays,
  MapPin,
  MoreHorizontal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TripSummaryHeaderProps {
  title: string
  location: string
  date: string
  status?: "upcoming" | "ongoing" | "completed"
  description?: string
  image?: string
  onMore?: () => void
  className?: string
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

function TripSummaryHeader({
  title,
  location,
  date,
  status = "upcoming",
  description,
  image,
  onMore,
  className,
}: TripSummaryHeaderProps) {
  const statusInfo = statusConfig[status]

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border",
        "bg-card",
        className
      )}
    >
      {image && (
        <div className="relative h-48 w-full overflow-hidden sm:h-64">
          <img
            src={image}
            alt=""
            className="size-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <Badge
            variant={statusInfo.variant}
            className="absolute bottom-5 left-5"
          >
            {statusInfo.label}
          </Badge>
        </div>
      )}

      <div className="p-5 sm:p-7">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            {!image && (
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            )}

            <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">

              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {location}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {date}
              </span>

            </div>

            {description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}

          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More options for ${title}`}
            onClick={onMore}
            className="shrink-0"
          >
            <MoreHorizontal />
          </Button>

        </div>

      </div>
    </section>
  )
}

export { TripSummaryHeader }