"use client"

import { Button } from "../../components/ui/button"

export default function MainPage() {
  return (
    <div className="min-h-screen bg-blue-100 dark:bg-gray-900 transition-colors duration-300">

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground dark:text-white transition-colors">PeerPrep</h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground text-balance dark:text-gray-300 text-balance transition-colors">
              Get started by reviewing or jump straight into collaborative coding!
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            {/* <a href="/history">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                View Attempt History
              </Button>
            </a> */}
            <a href="/matching">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Start Matching!
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
