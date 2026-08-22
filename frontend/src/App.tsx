import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import AppLayout from "@/layouts/AppLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

import Login from "@/pages/auth/Login"
import Signup from "@/pages/auth/Signup"
import ForgotPassword from "@/pages/auth/ForgotPassword"
import PublicTrip from "@/pages/app/PublicTrip"

import Dashboard from "@/pages/app/Dashboard"
import MyTrips from "@/pages/app/MyTrips"
import CreateTrip from "@/pages/app/CreateTrip"
import TripDetails from "@/pages/app/TripDetails"
import Discover from "@/pages/app/Discover"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/share/:slug" element={<PublicTrip />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-trips" element={<MyTrips />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/trip/:id/edit" element={<CreateTrip />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
