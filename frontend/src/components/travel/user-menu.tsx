import {
  LogOut,
  Settings,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  name: string
  email?: string
  avatar?: string
  className?: string
  onProfile?: () => void
  onSettings?: () => void
  onSignOut?: () => void
}

function UserMenu({
  name,
  email,
  avatar,
  className,
  onProfile,
  onSettings,
  onSignOut,
}: UserMenuProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        "w-full max-w-xs rounded-2xl border border-border",
        "bg-background p-2 shadow-sm",
        className
      )}
    >
      {/* User */}

      <div className="flex items-center gap-3 px-2 py-2">

        <Avatar size="default">
          {avatar && (
            <AvatarImage
              src={avatar}
              alt={name}
            />
          )}

          <AvatarFallback>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {name}
          </p>

          {email && (
            <p className="truncate text-xs text-muted-foreground">
              {email}
            </p>
          )}
        </div>

      </div>

      <div className="my-1 h-px bg-border" />

      {/* Actions */}

      <div className="space-y-0.5">

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onProfile}
        >
          <User />
          Profile
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSettings}
        >
          <Settings />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onSignOut}
        >
          <LogOut />
          Sign out
        </Button>

      </div>
    </div>
  )
}

export { UserMenu }