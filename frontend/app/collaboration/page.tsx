"use client"

import { useEffect, useState } from "react"
import ProblemDescriptionPanel from "./components/ProblemDescriptionPanel"
// import CollaborationEditor from "./components/CollaborationEditor"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { useRoomStore } from "../../store/useRoomStore"
import { AppHeader } from "../../components/navigation/AppHeader"
import { getActiveSession, type MatchQuestion } from "../../services/matching"

const CollaborationEditor = dynamic(
    () => import("./components/CollaborationEditor"),
    { ssr: false }
)


const CollaborationPage = () => {
  const searchParams = useSearchParams()
  const roomId = searchParams.get("roomId")
  const setRoomId = useRoomStore((state) => state.setRoomId)
  const [question, setQuestion] = useState<MatchQuestion | null>(null)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [questionLoading, setQuestionLoading] = useState<boolean>(false)

  useEffect(() => {
    if (roomId) {
      console.log("Joining room:", roomId)
      setRoomId(roomId)
    }
  }, [roomId, setRoomId])

  useEffect(() => {
    if (!roomId) {
      setQuestion(null)
      setQuestionError(null)
      return
    }

    let isCancelled = false

    const fetchSession = async () => {
      try {
        setQuestionLoading(true)
        const session = await getActiveSession()

        if (isCancelled) return

        if (session.roomId && roomId && session.roomId !== roomId) {
          console.warn("Active session room differs from current roomId", { sessionRoom: session.roomId, queryRoom: roomId })
        }

        setQuestion(session.question ?? null)
        console.log("Loaded question for collaboration session:", session.question)
        setQuestionError(null)
      } catch (error) {
        if (isCancelled) return
        console.error("Failed to load collaboration session", error)
        const message = error instanceof Error ? error.message : "Unable to load question"
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
  }, [roomId])

  return (
    <div className="flex min-h-screen flex-col bg-blue-100">
      <AppHeader />
      <div className="flex flex-1">
        <ProblemDescriptionPanel question={question} loading={questionLoading} error={questionError} />
        <CollaborationEditor roomId={roomId} />
      </div>
    </div>
  )
}

export default CollaborationPage