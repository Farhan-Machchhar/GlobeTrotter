import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  bio?: string;
  profile_picture_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem("token"),
      isAuthenticated: !!localStorage.getItem("token"),
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password,
          });

          const { access_token, user: apiUser } = response.data;
          const userObj: User = {
            id: apiUser.id,
            email: apiUser.email,
            username: apiUser.username || "",
            name: apiUser.full_name || apiUser.first_name || apiUser.username || email.split("@")[0],
            first_name: apiUser.first_name,
            last_name: apiUser.last_name,
            full_name: apiUser.full_name,
            bio: apiUser.bio,
            profile_picture_url: apiUser.profile_picture_url,
          };

          localStorage.setItem("token", access_token);
          set({
            user: userObj,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          if (import.meta.env.VITE_USE_MOCK_API === "true") {
            console.warn("Using mock auth fallback");
            const fallbackUser: User = {
              id: "demo-user-id",
              email,
              name: email.split("@")[0] || "Explorer",
            };
            const fallbackToken = "demo-jwt-token-globetrotter";
            localStorage.setItem("token", fallbackToken);
            set({
              user: fallbackUser,
              token: fallbackToken,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          const msg = err.response?.data?.detail || err.message || "Login failed.";
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const [first_name, ...rest] = name.split(" ");
          const last_name = rest.join(" ");

          const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
            email,
            password,
            first_name,
            last_name,
            full_name: name,
            username: email.split("@")[0].replace(/[^a-zA-Z0-9]/g, ""),
          });

          const { access_token, user: apiUser } = response.data;
          const userObj: User = {
            id: apiUser.id,
            email: apiUser.email,
            username: apiUser.username || "",
            name: name,
            first_name: apiUser.first_name,
            last_name: apiUser.last_name,
            full_name: apiUser.full_name,
          };

          localStorage.setItem("token", access_token);
          set({
            user: userObj,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          if (import.meta.env.VITE_USE_MOCK_API === "true") {
            console.warn("Using mock signup fallback");
            const fallbackUser: User = {
              id: `user-${Date.now()}`,
              email,
              name,
            };
            const fallbackToken = "demo-jwt-token-globetrotter";
            localStorage.setItem("token", fallbackToken);
            set({
              user: fallbackUser,
              token: fallbackToken,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          const msg = err.response?.data?.detail || err.message || "Signup failed.";
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const apiUser = response.data;
          set({
            user: {
              id: apiUser.id,
              email: apiUser.email,
              username: apiUser.username,
              name: apiUser.full_name || apiUser.first_name || apiUser.email,
              first_name: apiUser.first_name,
              last_name: apiUser.last_name,
              full_name: apiUser.full_name,
              bio: apiUser.bio,
              profile_picture_url: apiUser.profile_picture_url,
            },
            isAuthenticated: true,
          });
        } catch {
          // If token invalid, clear
          if (token.startsWith("demo-")) return; // keep demo token
          localStorage.removeItem("token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "globetrotter-auth",
    }
  )
);