"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
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
import {createPendingAttempt} from "../../services/history/realHistory";
import { getCustomRoomInfo, type CustomRoomParticipant } from "../../services/matching"
import { Copy } from "lucide-react"

const CollaborationEditor = dynamic(
    () => import("./components/CollaborationEditor"),
    { ssr: false }
)
function CollaborationPageContent() {
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
  const [localAttemptId, setAttemptId] = useState<string | null>(null)
  const [customRoomParticipants, setCustomRoomParticipants] = useState<CustomRoomParticipant[]>([])
  const [roomCode, setRoomCode] = useState<string | null>(null)

  const participants = useMemo(() => {
    // For custom rooms, use fetched participants
    if (session?.isCustomRoom && customRoomParticipants.length > 0) {
      return customRoomParticipants.map(p => ({
        name: p.username,
        isCurrentUser: p.userId === currentUser?.id,
      }))
    }
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
  }, [currentUser, session?.partnerId, session?.partnerUsername, customRoomParticipants])

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

    const wasCustomRoom = session.isCustomRoom

    try {
      await leaveSession()
      clearSession()
      clearRoomId()
      setQuestion(null)
      setConfirmLeaveOpen(false)
      const noticeParam = wasCustomRoom ? "left-custom-room" : "session-ended"
      router.replace(`/matching?notice=${noticeParam}`)
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
          const wasCustomRoom = session?.isCustomRoom

          clearSession()
          clearRoomId()
          setQuestion(null)
          setQuestionError("Your collaboration session is no longer active.")
          if (!manualLeaveRef.current) {
            const noticeParam = wasCustomRoom ? "left-custom-room" : "session-ended"
            router.replace(`/matching?notice=${noticeParam}`)
          }
          return
        }

        if (activeSession.roomId && activeSession.roomId !== roomId) {
          console.warn("Active session room differs from current roomId", { sessionRoom: activeSession.roomId, queryRoom: roomId })
          router.replace(`/collaboration?roomId=${encodeURIComponent(activeSession.roomId)}`)
        }

        setSession(activeSession)
        setQuestion(activeSession.question ?? null)
        console.log("Question:", activeSession.question)

        //record attempt in db
        if(activeSession.question && currentUser) {
          //only create pending attempt if not already exists
          if(activeSession.attemptId) {
            return
          }
        try {
          const pendingAttempt = await createPendingAttempt({
            userId: currentUser.id,
            questionId: String(activeSession.question.id),
            question: activeSession.question
            })

          setAttemptId(String(pendingAttempt.id)); // update local state to pass to CollaborationEditor
          const updatedSession = { ...activeSession, attemptId: String(pendingAttempt.id) }
          setSession(updatedSession)

        } catch (attemptError) {
            console.error("Failed to create pending attempt for collaboration session", attemptError)
          }
        }

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
    if (!session?.isCustomRoom || !session.roomCode) {
      setCustomRoomParticipants([])
      return
    }

    let isCancelled = false

    const fetchParticipants = async () => {
      try {
        const roomInfo = await getCustomRoomInfo(session.roomCode!)
        console.log("Fetched participants:", roomInfo.participants)
        if (!isCancelled) {
          setCustomRoomParticipants(roomInfo.participants)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch custom room participants:", error)
        }
      }
    }

    void fetchParticipants()

    // Poll for participant updates every 5 seconds
    const interval = setInterval(() => {
      void fetchParticipants()
    }, 5000)

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [session?.isCustomRoom, session?.roomCode])

  useEffect(() => {
    if (session?.isCustomRoom && session?.roomCode) {
      setRoomCode(session.roomCode)
    } else {
      setRoomCode(null)
    }
  }, [session])

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

      const wasCustomRoom = previousSession.isCustomRoom

      clearRoomId()
      setQuestion(null)
      setQuestionError("Your collaboration session has ended.")
      const noticeParam = wasCustomRoom ? "left-custom-room" : "session-ended"
      router.replace(`/matching?notice=${noticeParam}`)
    }
    previousSessionRef.current = session
  }, [session, router, clearRoomId])

  return (
    <>
      <div className="flex min-h-screen flex-col bg-blue-100">
        <AppHeader />
        {roomCode && (
          <div className="bg-blue-500 px-6 py-3 text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Room Code:</span>
                <span className="rounded-lg bg-white/20 px-4 py-1 font-mono text-lg font-bold tracking-wider">
                  {roomCode}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomCode)
                  alert('Room code copied to clipboard!')
                }}
                className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30"
              >
                <Copy className="h-4 w-4" />
                Copy Code
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-1">
          <ProblemDescriptionPanel question={question} loading={questionLoading} error={questionError} />
          <CollaborationEditor
            roomId={roomId}
            participants={participants}
            onRequestLeave={handleRequestLeave}
            leaving={isLeaving}
            attemptId={localAttemptId ?? undefined}
            questionDescription={question?.description ?? ""}
          />
        </div>
      </div>
      {confirmLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Leave collaboration session?</h2>
            <p className="mt-2 text-sm text-slate-600">
              {session?.isCustomRoom
                ? "Leaving will remove you from this custom room. Other participants can continue collaborating. You can rejoin later with the room details if others are still collaborating."
                : "Leaving will close the collaboration room for both participants. Your partner will be notified and redirected back to matching."
              }
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

export default function CollaborationPage() {
  return (
    <Suspense fallback={null}>
      <CollaborationPageContent />
    </Suspense>
  )
}