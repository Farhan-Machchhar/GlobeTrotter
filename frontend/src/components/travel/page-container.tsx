import * as React from "react"

import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl",
        "px-4 py-8",
        "sm:px-6 sm:py-10",
        "lg:px-8 lg:py-12",
        className
      )}
    >
      {children}
    </div>
  )
}

export { PageContainer }