import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    // Layout
    "group/badge inline-flex",
    "h-5 w-fit shrink-0",
    "items-center justify-center",
    "gap-1",

    // Shape
    "rounded-4xl",

    // Typography
    "px-2.5 py-0.5",
    "text-xs font-medium",
    "whitespace-nowrap",

    // Overflow
    "overflow-hidden",

    // Interaction
    "transition-colors duration-200",
    "focus-visible:outline-none",
    "focus-visible:border-ring",
    "focus-visible:ring-3",
    "focus-visible:ring-ring/30",

    // Invalid
    "aria-invalid:border-destructive",
    "aria-invalid:ring-destructive/20",
    "dark:aria-invalid:ring-destructive/40",

    // Icons
    "[&>svg]:pointer-events-none",
    "[&>svg]:size-3!",

    // Icon spacing
    "has-data-[icon=inline-end]:pr-1.5",
    "has-data-[icon=inline-start]:pl-1.5",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary travel accent
        default:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/85",

        // Neutral information
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",

        // Warnings / errors
        destructive:
          "bg-destructive/10 text-destructive [a]:hover:bg-destructive/15",

        // Categories / filters
        outline:
          "border border-border bg-transparent text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",

        // Very low emphasis
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",

        // Link-style badge
        link:
          "bg-transparent text-primary underline-offset-4 hover:underline",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",

    props: mergeProps<"span">(
      {
        className: cn(
          badgeVariants({ variant }),
          className
        ),
      },
      props
    ),

    render,

    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }