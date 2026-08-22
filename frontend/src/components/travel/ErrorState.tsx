import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again in a moment.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-destructive/10 bg-destructive/[0.03] px-6 py-12 text-center">

      <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" />
      </div>

      <h2 className="font-heading text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={onRetry}
        >
          <RefreshCw />
          Try again
        </Button>
      )}

    </div>
  )
}

export { ErrorState }