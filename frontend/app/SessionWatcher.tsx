"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getActiveSession, leaveSession } from "../services/matching"
import { useSessionStore } from "../store/useSessionStore"
import { useAuthStore } from "../store/useAuthStore"
import { useRoomStore } from "../store/useRoomStore"

const CHECK_INTERVAL_MS = 7000

function SessionWatcherContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)
  const clearSession = useSessionStore((state) => state.clearSession)

  const clearRoomId = useRoomStore((state) => state.clearRoomId)

  const authInitialized = useAuthStore((state) => state.initialized)
  const user = useAuthStore((state) => state.user)

  const [checking, setChecking] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const previousSessionRef = useRef(session)

  const roomIdParam = useMemo(() => searchParams?.get("roomId") ?? null, [searchParams])
  const isCollaborationPage = pathname?.startsWith("/collaboration") ?? false
  const isInActiveRoom = Boolean(session && isCollaborationPage && session.roomId === roomIdParam)

  useEffect(() => {
    if (!authInitialized) {
      return
    }

    if (!user?.id) {
      clearSession()
      clearRoomId()
      setModalOpen(false)
      setError(null)
      return
    }

    let cancelled = false
    let intervalId: number | undefined

    const fetchSession = async () => {
      try {
        setChecking(true)
        const activeSession = await getActiveSession()
        if (cancelled) return

        if (activeSession) {
          setSession(activeSession)
          setError(null)
        } else {
          clearSession()
          clearRoomId()
          setError(null)
        }
      } catch (err) {
        if (cancelled) return
        console.error("Failed to check active session", err)
        const message = err instanceof Error ? err.message : "Failed to check active session"
        setError(message)
      } finally {
        if (!cancelled) {
          setChecking(false)
        }
      }
    }

    void fetchSession()

    intervalId = window.setInterval(fetchSession, CHECK_INTERVAL_MS)

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchSession()
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelled = true
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [authInitialized, user?.id, pathname, roomIdParam, setSession, clearSession, clearRoomId])

  useEffect(() => {
    if (session && isCollaborationPage && session.roomId && roomIdParam && session.roomId !== roomIdParam) {
      router.replace(`/collaboration?roomId=${encodeURIComponent(session.roomId)}`)
    }
  }, [session, isCollaborationPage, roomIdParam, router])

  useEffect(() => {
    setModalOpen(Boolean(session && (!isCollaborationPage || !isInActiveRoom)))
  }, [session, isCollaborationPage, isInActiveRoom])

  useEffect(() => {
    const previousSession = previousSessionRef.current
    if (previousSession && !session) {
      const wasCustomRoom = previousSession.isCustomRoom
      const noticeParam = wasCustomRoom ? "left-custom-room" : "session-ended"
      router.replace(`/matching?notice=${noticeParam}`)
    }
    previousSessionRef.current = session
  }, [session, router])

  const handleReturnToSession = () => {
    if (!session) return
    setModalOpen(false)
    if (isInActiveRoom) {
      return
    }
    router.push(`/collaboration?roomId=${encodeURIComponent(session.roomId)}`)
  }

  const handleLeaveSession = async () => {
    if (!session) return
    try {
      setLeaving(true)
      await leaveSession()
      clearSession()
      clearRoomId()
      setModalOpen(false)
      if (isInActiveRoom) {
        router.push("/matching")
      }
    } catch (err) {
      console.error("Failed to leave session", err)
      const message = err instanceof Error ? err.message : "Failed to leave session"
      setError(message)
    } finally {
      setLeaving(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Active collaboration session</h2>
            <p className="mt-2 text-sm text-slate-600">
              You are still connected to a collaboration room with {session.partnerUsername ?? "your partner"}.
            </p>
            {session.topic || session.difficulty ? (
              <p className="mt-2 text-sm text-slate-500">
                Topic: {session.topic ?? "Any"} · Difficulty: {session.difficulty ?? "Unknown"}
              </p>
            ) : null}
            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleLeaveSession}
                disabled={leaving || checking}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {leaving ? "Leaving..." : "Leave session"}
              </button>
              <button
                type="button"
                onClick={handleReturnToSession}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Return to session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function SessionWatcher() {
  return (
    <Suspense fallback={null}>
      <SessionWatcherContent />
    </Suspense>
  )
}
