import { Outlet } from "react-router-dom"

import { AppHeader } from "@/components/travel/app-header"

function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout