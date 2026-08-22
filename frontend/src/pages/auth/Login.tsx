import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Plane } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { useAuthStore } from "@/store/authStore"

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const emailError =
    emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Please enter a valid email address."
      : ""

  const passwordError =
    passwordTouched && password.length < 8
      ? "Password must be at least 8 characters."
      : ""

  const isValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 8

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    setEmailTouched(true)
    setPasswordTouched(true)

    if (!isValid) return

    login(email, password)

    const from =
      (location.state as { from?: string } | null)?.from ??
      "/dashboard"

    navigate(from, { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Plane className="size-6" />
          </div>

          <div>
            <CardTitle className="text-2xl">
              Welcome back
            </CardTitle>

            <CardDescription className="mt-2">
              Sign in to continue planning your adventures.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={!!emailError}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setEmailTouched(true)
                }}
                onBlur={() => setEmailTouched(true)}
              />

              {emailError && (
                <p className="text-xs text-destructive">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  aria-invalid={!!passwordError}
                  className="pr-10"
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setPasswordTouched(true)
                  }}
                  onBlur={() => setPasswordTouched(true)}
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="text-xs text-destructive">
                  {passwordError}
                </p>
              )}

              {!passwordError && password.length > 0 && password.length < 8 && (
                <p className="text-xs text-muted-foreground">
                  {8 - password.length} more character
                  {8 - password.length === 1 ? "" : "s"} required.
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!isValid}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default Login