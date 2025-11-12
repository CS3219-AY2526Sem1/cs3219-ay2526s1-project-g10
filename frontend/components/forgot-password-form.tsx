"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import Link from "next/link"
import { forgotPassword } from "../services/auth"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await forgotPassword(email)
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset link")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold tracking-tight text-balance">Reset your password</h3>
        <p className="text-sm text-muted-foreground dark:text-gray-100">
          {isSubmitted
            ? "Check your email for a link to reset your password"
            : "Enter your email address and we'll send you a link to reset your password"}
        </p>
      </div>
      <div className="p-6 pt-0">
        {!isSubmitted ? (
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
                className="dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
              If an account exists for {email}, you will receive a password reset link shortly.
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent dark:bg-white dark:text-black"
              onClick={() => {
                setIsSubmitted(false)
                setEmail("")
              }}
            >
              Send another link
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center p-6 pt-0">
        <div className="text-sm text-center text-muted-foreground w-full">
          <Link href="/user/login" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
