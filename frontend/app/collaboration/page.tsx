"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ProblemDescriptionPanel from "./components/ProblemDescriptionPanel"
// import CollaborationEditor from "./components/CollaborationEditor"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useRoomStore } from "../../store/useRoomStore"
import { AppHeader } from "../../components/navigation/AppHeader"
import { getActiveSession, leaveSession, type MatchQuestion } from "../../services/matching"
import { useSessionStore } from "../../store/useSessionStore"
import { useAuthStore } from "../../store/useAuthStore"
import { Button } from "../../components/ui/button"

const CollaborationEditor = dynamic(
    () => import("./components/CollaborationEditor"),
    { ssr: false }
)


const CollaborationPage = () => {
  const searchParams = useSearchParams()
  const roomId = searchParams.get("roomId")
  const setRoomId = useRoomStore((state) => state.setRoomId)
  const clearRoomId = useRoomStore((state) => state.clearRoomId)
  const router = useRouter()
  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)
  const clearSession = useSessionStore((state) => state.clearSession)
  const currentUser = useAuthStore((state) => state.user)
  const [question, setQuestion] = useState<MatchQuestion | null>(session?.question ?? null)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [questionLoading, setQuestionLoading] = useState<boolean>(false)
  const previousSessionRef = useRef(session)
  const manualLeaveRef = useRef(false)
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState<string | null>(null)

  const participants = useMemo(() => {
    const entries: { name: string; isCurrentUser?: boolean }[] = []
    if (currentUser) {
      const selfName = currentUser.username?.trim() || currentUser.email?.trim() || "You"
      entries.push({ name: selfName, isCurrentUser: true })
    }
    if (session?.partnerUsername) {
      entries.push({ name: session.partnerUsername })
    } else if (session?.partnerId) {
      entries.push({ name: `User ${session.partnerId}` })
    }
    return entries
  }, [currentUser, session?.partnerId, session?.partnerUsername])

  const handleRequestLeave = () => {
    setLeaveError(null)
    setConfirmLeaveOpen(true)
  }

  const handleCancelLeave = () => {
    if (isLeaving) return
    setConfirmLeaveOpen(false)
  }

  const handleConfirmLeave = async () => {
    if (!session) {
      setConfirmLeaveOpen(false)
      return
    }

    manualLeaveRef.current = true
    setIsLeaving(true)
    setLeaveError(null)

    try {
      await leaveSession()
      clearSession()
      clearRoomId()
      setQuestion(null)
      setConfirmLeaveOpen(false)
      router.replace("/matching?notice=session-ended")
    } catch (error) {
      manualLeaveRef.current = false
      console.error("Failed to leave collaboration session", error)
      const message = error instanceof Error ? error.message : "Failed to leave session"
      setLeaveError(message)
    } finally {
      setIsLeaving(false)
      setTimeout(() => {
        manualLeaveRef.current = false
      }, 0)
    }
  }

  useEffect(() => {
    if (roomId) {
      console.log("Joining room:", roomId)
      setRoomId(roomId)
    }
  }, [roomId, setRoomId])

  useEffect(() => {
    if (!roomId) {
      clearSession()
      clearRoomId()
      setQuestion(null)
      setQuestionError("No collaboration room specified.")
      setQuestionLoading(false)
      return
    }

    let isCancelled = false

    const fetchSession = async () => {
      try {
        setQuestionLoading(true)
        const activeSession = await getActiveSession()

        if (isCancelled) return

        if (!activeSession) {
          clearSession()
          clearRoomId()
          setQuestion(null)
          setQuestionError("Your collaboration session is no longer active.")
          if (!manualLeaveRef.current) {
            router.replace("/matching?notice=session-ended")
          }
          return
        }

        if (activeSession.roomId && activeSession.roomId !== roomId) {
          console.warn("Active session room differs from current roomId", { sessionRoom: activeSession.roomId, queryRoom: roomId })
          router.replace(`/collaboration?roomId=${encodeURIComponent(activeSession.roomId)}`)
        }

        setSession(activeSession)
        setQuestion(activeSession.question ?? null)
        setQuestionError(null)
      } catch (error) {
        if (isCancelled) return
        console.error("Failed to load collaboration session", error)
        const message = error instanceof Error ? error.message : "Unable to load collaboration session"
        setQuestion(null)
        setQuestionError(message)
      } finally {
        if (!isCancelled) {
          setQuestionLoading(false)
        }
      }
    }

    void fetchSession()

    return () => {
      isCancelled = true
    }
  }, [roomId, clearSession, clearRoomId, router, setSession])

  useEffect(() => {
    if (session?.question) {
      setQuestion(session.question)
      setQuestionError(null)
    }
  }, [session])

  useEffect(() => {
    const previousSession = previousSessionRef.current
    if (previousSession && !session) {
      if (manualLeaveRef.current) {
        previousSessionRef.current = session
        return
      }
      clearRoomId()
      setQuestion(null)
      setQuestionError("Your collaboration session has ended.")
      router.replace("/matching?notice=session-ended")
    }
    previousSessionRef.current = session
  }, [session, router, clearRoomId])

  return (
    <>
      <div className="flex min-h-screen flex-col bg-blue-100">
        <AppHeader />
        <div className="flex flex-1">
          <ProblemDescriptionPanel question={question} loading={questionLoading} error={questionError} />
          <CollaborationEditor
            roomId={roomId}
            participants={participants}
            onRequestLeave={handleRequestLeave}
            leaving={isLeaving}
          />
        </div>
      </div>
      {confirmLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Leave collaboration session?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Leaving will close the collaboration room for both participants. Your partner will be notified and
              redirected back to matching.
            </p>
            {leaveError && <p className="mt-3 text-sm text-red-500">{leaveError}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelLeave}
                disabled={isLeaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmLeave}
                disabled={isLeaving}
              >
                {isLeaving ? "Leaving..." : "Leave session"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CollaborationPage