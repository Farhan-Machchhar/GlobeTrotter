import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        [
          // Layout
          "h-10 w-full min-w-0",
          "px-3.5 py-2",

          // Shape
          "rounded-xl",
          "border border-input",

          // Typography
          "bg-background",
          "text-sm text-foreground",

          // Placeholder
          "placeholder:text-muted-foreground",

          // Interaction
          "transition-all duration-200 ease-out",
          "outline-none",

          // Focus
          "focus-visible:border-ring",
          "focus-visible:ring-3",
          "focus-visible:ring-ring/30",

          // Disabled
          "disabled:pointer-events-none",
          "disabled:cursor-not-allowed",
          "disabled:bg-muted",
          "disabled:opacity-50",

          // Invalid
          "aria-invalid:border-destructive",
          "aria-invalid:ring-3",
          "aria-invalid:ring-destructive/20",

          // File input
          "file:inline-flex",
          "file:h-7",
          "file:border-0",
          "file:bg-transparent",
          "file:text-sm",
          "file:font-medium",
          "file:text-foreground",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

export { Input }
