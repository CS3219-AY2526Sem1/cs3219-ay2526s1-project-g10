"use client"

import { use, useEffect } from "react"
import ProblemDescriptionPanel from "./components/ProblemDescriptionPanel"
// import CollaborationEditor from "./components/CollaborationEditor"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { useRoomStore } from "../../store/useRoomStore"

const mockQuestion = {
  title: "Two Sum",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] == 9, so return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] == 6, so return [1, 2]."
    }
  ]
}

const CollaborationEditor = dynamic(
    () => import("./components/CollaborationEditor"),
    { ssr: false }
)


const CollaborationPage = () => {

    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId");
    const setRoomId = useRoomStore((state) => state.setRoomId);

    useEffect(() => {
        if (roomId) {
            console.log("Joining room:", roomId);
            setRoomId(roomId);
           
        }

    }, [roomId]);

    return (
        <div className="min-h-screen bg-blue-100">
        <div className="flex h-screen">
          <ProblemDescriptionPanel
            title={mockQuestion.title}
            description={mockQuestion.description}
            examples={mockQuestion.examples}
          />
          <CollaborationEditor roomId={roomId}/>
        </div>
      </div>
    );
}

export default CollaborationPage;