import * as React from "react"

import { Compass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-64 w-full flex-col items-center justify-center",
        "rounded-2xl border border-dashed border-border",
        "bg-muted/20 px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon ?? <Compass className="size-6" />}
      </div>

      <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {actionLabel && (
        <Button
          className="mt-5"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }