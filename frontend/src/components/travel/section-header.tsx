import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

function SectionHeader({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="type-h2">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-2xl type-body text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actionLabel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="shrink-0 self-start sm:self-auto"
        >
          {actionLabel}
          <ArrowRight />
        </Button>
      )}
    </div>
  )
}

export { SectionHeader }