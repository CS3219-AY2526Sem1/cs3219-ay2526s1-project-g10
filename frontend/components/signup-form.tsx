"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signup } from "../services/auth"
import { useAuth } from "../contexts/auth-context"

export function SignupForm() {
  const [name, setName] = useState("")
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
      const { user } = await signup(name, email, password)

      // Check if email verification is required
      // Supabase returns user.email_confirmed_at as null if unverified
      if (user.email_confirmed_at === null || user.email_confirmed_at === undefined) {
        // Redirect to verification page instead of continuing
        router.push(`/user/verify-email?email=${encodeURIComponent(email)}`)
        return
      }

      localStorage.setItem("auth_token", user.id)
      localStorage.setItem("mock_user", JSON.stringify(user))

      await refreshUser()

      router.push("/matching")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold tracking-tight text-balance">Create an account</h3>
        <p className="text-sm text-muted-foreground">Enter your information to create your account</p>
      </div>
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="name">Username</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={isLoading}
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isLoading}
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
      <div className="flex items-center p-6 pt-0">
        <div className="text-sm text-center text-muted-foreground w-full">
          Already have an account?{" "}
          <Link href="/user/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
