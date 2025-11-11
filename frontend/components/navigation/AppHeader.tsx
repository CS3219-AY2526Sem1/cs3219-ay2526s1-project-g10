"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, Folder, User } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

const navItems = [
  { href: "/matching", label: "Match", icon: User },
  { href: "/question", label: "Questions", icon: Folder },
  { href: "/history", label: "Attempt History", icon: Clock },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="bg-blue-100 dark:bg-gray-800 px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/main" className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity">
            Peer
            <br />
            Prep
          </Link>

          <nav className="flex items-center gap-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors ${
                    isActive ? "bg-blue-300 dark:bg-gray-700" : "bg-blue-200 dark:bg-gray-600 hover:bg-blue-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/user/profile"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-900 dark:border-gray-100 bg-blue-200 dark:bg-gray-600 transition-colors hover:bg-blue-300 dark:hover:bg-gray-700"
          >
            <User className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </Link>
        </div>
      </div>
    </header>
  )
}
