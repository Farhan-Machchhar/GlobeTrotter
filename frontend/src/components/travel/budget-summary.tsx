import {
  IndianRupee,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BudgetSummaryProps {
  total: string
  spent: string
  remaining: string
  progress?: number
  currency?: string
  className?: string
}

function BudgetSummary({
  total,
  spent,
  remaining,
  progress = 0,
  currency = "₹",
  className,
}: BudgetSummaryProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Trip Budget</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your planned travel expenses.
            </p>
          </div>

          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="size-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Total */}

        <div>
          <p className="text-sm text-muted-foreground">
            Total budget
          </p>

          <div className="mt-1 flex items-center gap-1">
            <IndianRupee className="size-5" />
            <span className="font-heading text-2xl font-semibold tracking-tight">
              {total}
            </span>
          </div>
        </div>

        {/* Progress */}

        <div className="space-y-2">

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Budget used
            </span>

            <span className="font-medium">
              {safeProgress}%
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={safeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${safeProgress}%` }}
            />
          </div>

        </div>

        {/* Breakdown */}

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Spent
            </p>

            <p className="mt-1 font-heading text-lg font-semibold">
              {currency}{spent}
            </p>

            <Badge
              variant="secondary"
              className="mt-2"
            >
              <TrendingUp />
              Current
            </Badge>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Remaining
            </p>

            <p className="mt-1 font-heading text-lg font-semibold">
              {currency}{remaining}
            </p>
          </div>

        </div>

      </CardContent>
    </Card>
  )
}

export { BudgetSummary }