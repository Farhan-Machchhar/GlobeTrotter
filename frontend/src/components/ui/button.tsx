import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "rounded-xl border border-transparent bg-clip-padding",
    "text-sm font-medium whitespace-nowrap",
    "transition-all duration-200 ease-out",
    "outline-none select-none",

    // Focus
    "focus-visible:border-ring",
    "focus-visible:ring-3 focus-visible:ring-ring/30",

    // Active
    "active:not-aria-[haspopup]:translate-y-px",

    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",

    // Validation
    "aria-invalid:border-destructive",
    "aria-invalid:ring-3",
    "aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50",
    "dark:aria-invalid:ring-destructive/40",

    // Icons
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /*
         * PRIMARY
         * Main GlobeTrotter actions
         */
        default:
          [
            "bg-primary text-primary-foreground",
            "shadow-sm",
            "hover:bg-travel-blue-hover",
            "hover:shadow-md",
          ].join(" "),

        /*
         * OUTLINE
         * Secondary but still visible actions
         */
        outline:
          [
            "border-border",
            "bg-background",
            "text-foreground",
            "hover:bg-muted",
            "hover:border-border",
          ].join(" "),

        /*
         * SECONDARY
         * Soft filled button
         */
        secondary:
          [
            "bg-secondary",
            "text-secondary-foreground",
            "hover:bg-secondary/80",
          ].join(" "),

        /*
         * GHOST
         * Minimal actions
         */
        ghost:
          [
            "text-foreground",
            "hover:bg-muted",
            "hover:text-foreground",
          ].join(" "),

        /*
         * DESTRUCTIVE
         * Delete / remove / dangerous actions
         */
        destructive:
          [
            "bg-destructive/10",
            "text-destructive",
            "hover:bg-destructive/15",
            "focus-visible:ring-destructive/20",
          ].join(" "),

        /*
         * LINK
         * Text-only navigation
         */
        link:
          [
            "text-primary",
            "underline-offset-4",
            "hover:underline",
          ].join(" "),
      },

      size: {
        /*
         * DEFAULT
         * Main application button
         */
        default:
          [
            "h-10",
            "gap-2",
            "px-4",
            "rounded-xl",
          ].join(" "),

        /*
         * EXTRA SMALL
         */
        xs:
          [
            "h-7",
            "gap-1",
            "rounded-lg",
            "px-2",
            "text-xs",
          ].join(" "),

        /*
         * SMALL
         */
        sm:
          [
            "h-8",
            "gap-1.5",
            "rounded-lg",
            "px-3",
            "text-sm",
          ].join(" "),

        /*
         * LARGE
         * Hero / primary CTA
         */
        lg:
          [
            "h-12",
            "gap-2",
            "rounded-xl",
            "px-6",
            "text-base",
          ].join(" "),

        /*
         * ICON
         */
        icon:
          "size-10 rounded-xl",

        "icon-xs":
          "size-7 rounded-lg",

        "icon-sm":
          "size-8 rounded-lg",

        "icon-lg":
          "size-12 rounded-xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
