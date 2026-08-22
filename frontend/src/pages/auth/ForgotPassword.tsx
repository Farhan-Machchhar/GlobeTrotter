import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, Plane } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [touched, setTouched] = useState(false)

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const emailError =
        touched && !emailValid
            ? "Please enter a valid email address."
            : ""

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        setTouched(true)

        if (!emailValid) return

        // Mock behavior for now.
        setSubmitted(true)
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
                            Forgot your password?
                        </CardTitle>

                        <CardDescription className="mt-2">
                            Enter your email and we'll send you a password reset link.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    {submitted ? (
                        <div className="space-y-5 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                                <Mail className="size-5 text-primary" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="font-medium">
                                    Check your email
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    If an account exists for{" "}
                                    <span className="font-medium text-foreground">
                                        {email}
                                    </span>
                                    , we've sent instructions to reset your password.
                                </p>
                            </div>


                            <Link to="/login">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                ></Button>
                            </Link>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                            noValidate
                        >
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
                                        setTouched(true)
                                    }}
                                    onBlur={() => setTouched(true)}
                                />

                                {emailError && (
                                    <p className="text-xs text-destructive">
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={!emailValid}
                            >
                                Send reset link
                            </Button>

                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                                Back to sign in
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}

export default ForgotPassword