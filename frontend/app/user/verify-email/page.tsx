"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState("")

  const supabase = createClientComponentClient()

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setMessage("")

    try {
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-6">
          We've sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>

        {message && (
          <div className="mb-4 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md">
            {message}
          </div>
        )}

        <Button
          onClick={handleResendEmail}
          disabled={isResending}
          variant="outline"
          className="w-full"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </Button>
      </div>
    </div>
  )
}