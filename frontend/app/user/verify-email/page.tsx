"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Button } from "../../../components/ui/button"
import { createClient } from "@supabase/supabase-js"

function VerifyEmailPageContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState("")

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setMessage("")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zlsoqzwmopjffybmxjov.supabase.co"
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc29xendtb3BqZmZ5Ym14am92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODI5MTQsImV4cCI6MjA3NDM1ODkxNH0.qwqVDsyV40M-PJlXjPzUbp1KJPQtyqT3eAIEDZdps2E"

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase credentials missing")
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage("✅ Verification email sent! Check your inbox.")
      }
    } catch (err) {
      setMessage("Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md rounded-lg border border-border bg-card dark:bg-gray-800 text-card-foreground p-6 text-center shadow-lg transition-colors">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="text-2xl font-semibold mb-2 text-foreground dark:text-white transition-colors">Check your email</h1>
        <p className="text-muted-foreground dark:text-gray-100 mb-6">
          We've sent a verification link to{" "}
          <span className="font-medium text-foreground dark:text-white">{email}</span>
        </p>
        <p className="text-sm text-muted-foreground dark:text-gray-100 mb-6">
          Click the link in the email to verify your email address.
        </p>

        {message && (
          <div className="mb-4 p-3 text-sm rounded-md border bg-blue-50 border-blue-200 text-blue-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 transition-colors">
            {message}
          </div>
        )}

        <Button
          onClick={handleResendEmail}
          disabled={isResending}
          variant="outline"
          className="w-full dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </Button>

        <Button asChild variant="ghost" className="mt-4 w-full text-sm font-medium text-blue-600">
          <Link href="/user/login">Back to login</Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-4">Didn't receive the email? Check your spam folder.</p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}