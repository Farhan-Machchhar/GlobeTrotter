import {
  Menu,
  Plane,
} from "lucide-react"
import { NavLink, Link } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "My Trips",
    href: "/my-trips",
  },
  {
    label: "Discover",
    href: "/discover",
  },
]

interface AppHeaderProps {
  onMenuClick?: () => void
  className?: string
}

function AppHeader({
  onMenuClick,
  className,
}: AppHeaderProps) {
  const logout = useAuthStore((state) => state.logout)
  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "h-16 w-full",
        "border-b border-border/60",
        "bg-background/95 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}

        <Link
          to="/dashboard"
          className="group flex items-center gap-2.5"
        >
          <span
            className={cn(
              "flex size-8 items-center justify-center",
              "rounded-lg",
              "bg-primary",
              "text-primary-foreground",
              "transition-transform duration-200",
              "group-hover:scale-105"
            )}
          >
            <Plane className="size-4" />
          </span>

          <span className="font-heading text-base font-semibold tracking-tight">
            GlobeTrotter
          </span>
        </Link>


        {/* Desktop Navigation */}

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2",
                  "text-sm font-medium",
                  "transition-colors duration-200",

                  isActive
                    ? [
                      "bg-muted",
                      "text-foreground",
                    ].join(" ")
                    : [
                      "text-muted-foreground",
                      "hover:bg-muted/60",
                      "hover:text-foreground",
                    ].join(" ")
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>


        {/* Desktop Actions */}

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={logout}
          >
            <Avatar size="sm">
              <AvatarFallback>
                KP
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>


        {/* Mobile Menu */}

        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu />
          </Button>
        </div>

      </div>
    </header>
  )
}

export { AppHeader }