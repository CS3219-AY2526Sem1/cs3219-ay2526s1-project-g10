"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setStatus("success")
      setMessage("Password successfully reset! You can now log in with your new password.")

      setTimeout(() => {
        router.push("/user/login")
      }, 2000)
    } catch (err: any) {
      setStatus("error")
      setMessage(err.message || "Error resetting password.")
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-sm mx-auto mt-24">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold tracking-tight text-balance">Reset your password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your new password below to reset your account password.
        </p>
      </div>

      <div className="p-6 pt-0">
        <form onSubmit={handleReset} className="space-y-4">
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={status === "loading"}
            />
          </div>

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Resetting password..." : "Reset Password"}
          </Button>
        </form>
      </div>

      <div className="flex items-center p-6 pt-0">
        <div className="text-sm text-center text-muted-foreground w-full">
          <Button
            variant="link"
            onClick={() => router.push("/user/login")}
            className="font-medium text-foreground hover:underline"
          >
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  )
}
