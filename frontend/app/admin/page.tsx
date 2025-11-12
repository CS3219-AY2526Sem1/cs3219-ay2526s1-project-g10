"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/question")
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="rounded-2xl border border-blue-200 bg-white px-8 py-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Redirecting to question management…</h1>
        <p className="mt-3 text-sm text-gray-600">
          The admin panel focuses on question management. Hold tight while we take you to the questions dashboard.
        </p>
      </div>
    </div>
  )
}
