import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        [
          // Layout
          "group/card flex flex-col",
          "gap-(--card-spacing)",
          "overflow-hidden",

          // Shape
          "rounded-xl",

          // Surface
          "bg-card",
          "text-sm text-card-foreground",

          // Spacing
          "py-(--card-spacing)",
          "[--card-spacing:--spacing(4)]",

          // Boundary
          "ring-1 ring-foreground/10",

          // Small variant
          "data-[size=sm]:[--card-spacing:--spacing(3)]",

          // Image handling
          "has-[>img:first-child]:pt-0",
          "*:[img:first-child]:rounded-t-xl",
          "*:[img:last-child]:rounded-b-xl",

          // Footer handling
          "has-data-[slot=card-footer]:pb-0",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        [
          "group/card-header",
          "@container/card-header",

          "grid auto-rows-min",
          "items-start",
          "gap-1",

          "rounded-t-xl",
          "px-(--card-spacing)",

          "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
          "has-data-[slot=card-description]:grid-rows-[auto_auto]",

          "[.border-b]:pb-(--card-spacing)",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        [
          "font-heading",
          "text-base",
          "font-medium",
          "leading-snug",

          "group-data-[size=sm]/card:text-sm",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        [
          "col-start-2",
          "row-span-2",
          "row-start-1",

          "self-start",
          "justify-self-end",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        [
          "flex items-center",
          "rounded-b-xl",
          "p-(--card-spacing)",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}