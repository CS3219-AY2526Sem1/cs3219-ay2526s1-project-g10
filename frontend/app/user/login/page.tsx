"use client"

import { LoginForm } from "../../../components/login-form"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams?.get('message')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
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
