import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
        <Link
          href="/match"
          className="inline-block rounded-full bg-blue-400 px-6 py-3 font-medium text-gray-900 hover:bg-blue-500 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
