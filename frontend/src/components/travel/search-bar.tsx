import * as React from "react"

import {
  Search,
  X,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps
  extends Omit<React.ComponentProps<"input">, "className"> {
  className?: string
  onClear?: () => void
}

function SearchBar({
  value,
  defaultValue,
  onClear,
  className,
  placeholder = "Search destinations, cities, or countries...",
  ...props
}: SearchBarProps) {
  const hasValue =
    value !== undefined
      ? String(value).length > 0
      : defaultValue !== undefined
        ? String(defaultValue).length > 0
        : false

  return (
    <div
      className={cn(
        "relative flex h-10 w-full items-center",
        className
      )}
    >
      {/* Search Icon */}

      <Search
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-3.5 z-10",
          "size-4",
          "text-muted-foreground"
        )}
      />

      {/* Input */}

      <Input
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 pl-10 pr-10"
        {...props}
      />

      {/* Clear */}

      {hasValue && onClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-1 z-10"
        >
          <X />
        </Button>
      )}
    </div>
  )
}

export { SearchBar }