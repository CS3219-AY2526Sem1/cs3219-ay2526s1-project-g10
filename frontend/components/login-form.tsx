"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "../services/auth"
import { useAuth } from "../contexts/auth-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { user, token } = await login(email, password)

      if (!user.email_confirmed_at) {
        setError("Please verify your email before logging in.")
        router.push(`/user/verify-email?email=${encodeURIComponent(email)}`)
        return
      }

      // Store token for API calls
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user", JSON.stringify(user))

      // Refresh user in context
      await refreshUser()

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/main")
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold tracking-tight text-balance">Welcome back</h3>
        <p className="text-sm text-muted-foreground">Enter your email and password to sign in to your account</p>
      </div>
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/user/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
      <div className="flex items-center p-6 pt-0">
        <div className="text-sm text-center text-muted-foreground w-full">
          {"Don't have an account? "}
          <Link href="/user/signup" className="font-medium text-foreground hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
