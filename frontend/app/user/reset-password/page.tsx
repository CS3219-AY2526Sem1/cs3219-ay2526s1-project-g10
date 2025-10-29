"use client"

import { useState } from "react"
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
    <form
      onSubmit={handleReset}
      className="flex flex-col gap-4 w-full max-w-sm bg-white p-6 rounded-xl shadow-md mx-auto mt-24"
    >
      <h1 className="text-2xl font-semibold text-gray-900 text-center">Reset Password</h1>
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {status === "loading" ? "Resetting password..." : "Reset Password"}
      </button>

      {message && (
        <p
          className={`text-sm text-center ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
