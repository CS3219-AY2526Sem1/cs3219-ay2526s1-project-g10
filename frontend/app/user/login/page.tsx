"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "../../../components/login-form"
import { useAuth } from "../../../contexts/auth-context"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams?.get("next") ?? "/main"
  const message = searchParams?.get('message')

  useEffect(() => {
    if (!loading && user) {
      router.replace(next)
    }
  }, [loading, user, next, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-100 text-green-800 max-w-md w-full text-center">
          {message}
        </div>
      )}

      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
