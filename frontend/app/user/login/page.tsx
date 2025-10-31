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

  useEffect(() => {
    if (!loading && user) {
      router.replace(next)
    }
  }, [loading, user, next, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <LoginForm />
    </div>
  )
}
