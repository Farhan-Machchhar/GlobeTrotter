import {
  Clock3,
  MapPin,
  MoreHorizontal,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActivityCardProps {
  title: string
  location: string
  time: string
  duration?: string
  category?: string
  description?: string
  className?: string
  onMore?: () => void
}

function ActivityCard({
  title,
  location,
  time,
  duration,
  category,
  description,
  className,
  onMore,
}: ActivityCardProps) {
  return (
    <Card
      className={cn(
        "w-full transition-all duration-200",
        "hover:shadow-sm",
        className
      )}
    >
      <CardHeader className="pb-3">
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

        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="secondary">
              {category}
            </Badge>
          )}
        </div>

        <CardTitle className="text-base">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">

            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" />
              {time}
            </span>

            {duration && (
              <span>
                {duration}
              </span>
            )}

          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span>{location}</span>
          </div>

          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

        </div>
      </CardContent>
    </Card>
  )
}

export { ActivityCard }