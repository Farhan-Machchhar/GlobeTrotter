import {
  ArrowUpRight,
  MapPin,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DestinationCardProps {
  name: string
  country: string
  image: string
  description?: string
  tag?: string
  className?: string
  onExplore?: () => void
}

function DestinationCard({
  name,
  country,
  image,
  description,
  tag,
  className,
  onExplore,
}: DestinationCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "border-0",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">

        <img
          src={image}
          alt={name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {tag && (
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm"
          >
            {tag}
          </Badge>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">

          <div className="mb-2 flex items-center gap-1.5 text-sm text-white/80">
            <MapPin className="size-3.5" />
            {country}
          </div>

          <h3 className="font-heading text-xl font-semibold tracking-tight">
            {name}
          </h3>

          {description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">
              {description}
            </p>
          )}

          <Button
            variant="secondary"
            size="sm"
            className="mt-4 bg-white/95 text-foreground hover:bg-white"
            onClick={onExplore}
          >
            Explore
            <ArrowUpRight />
          </Button>

        </div>
      </div>
    </Card>
  )
}

export { DestinationCard }