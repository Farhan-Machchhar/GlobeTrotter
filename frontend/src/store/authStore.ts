import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  signup: (name: string, email: string, password: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email) => {
        set({
          user: {
            id: "demo-user",
            name: "Kavya",
            email,
          },
          isAuthenticated: true,
        })
      },

      signup: (name, email) => {
        set({
          user: {
            id: "demo-user",
            name,
            email,
          },
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "globetrotter-auth",
    }
  )
)