"use client"

import { useState } from "react"
import { ThemeToggle } from "../navigation/ThemeToggle"

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="w-full bg-primary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <a href='/' className="text-xl font-bold text-primary-foreground">PeerPrep</a>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="/matching"
                className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors"
              >
                Matching
              </a>
              <a
                href="/question"
                className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors"
              >
                Question
              </a>
              <a
                href="/history"
                className="text-sm text-primary-foreground hover:text-primary-foreground/80 transition-colors"
              >
                Question History
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 relative">
            <ThemeToggle />
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
            >
              <svg
                className="w-6 h-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    Admin Page
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
