import { isAxiosError } from "axios"
import { matchClient } from "../../network/axiosClient"
import { MatchQuestion } from "./types"

export interface CustomRoomCreateRequest {
  difficulty: string
  topic: string
  password: string
  roomName?: string
}

export interface CustomRoomCreateResponse {
  success: boolean
  roomCode: string
  roomId: string
  roomName: string
  difficulty: string
  topic: string
  question: MatchQuestion | null
}

export interface CustomRoomJoinRequest {
  roomCode: string
  password: string
}

export interface CustomRoomJoinResponse {
  success: boolean
  roomCode: string
  roomId: string
  roomName: string
  difficulty: string
  topic: string
  question: MatchQuestion | null
  alreadyJoined?: boolean
}

export interface CustomRoomParticipant {
  userId: string
  username: string
  isCreator: boolean
}

export interface CustomRoomInfo {
  roomCode: string
  roomId: string
  roomName: string
  difficulty: string
  topic: string
  creatorId: string
  creatorUsername: string
  participants: CustomRoomParticipant[]
  createdAt: number
}

export async function createCustomRoom(
  request: CustomRoomCreateRequest
): Promise<CustomRoomCreateResponse> {
  try {
    const response = await matchClient.post<CustomRoomCreateResponse>(
      "/api/match/custom-matching/create",
      request
    )
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: string })?.error ??
        error.message ??
        "Failed to create custom room"
      throw new Error(message)
    }
    throw error
  }
}

export async function joinCustomRoom(
  request: CustomRoomJoinRequest
): Promise<CustomRoomJoinResponse> {
  try {
    const response = await matchClient.post<CustomRoomJoinResponse>(
      "/api/match/custom-matching/join",
      request
    )
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: string })?.error ??
        error.message ??
        "Failed to join custom room"
      throw new Error(message)
    }
    throw error
  }
}

export async function getCustomRoomInfo(roomCode: string): Promise<CustomRoomInfo> {
  try {
    const response = await matchClient.get<CustomRoomInfo>(
      `/api/match/custom-matching/${roomCode}`
    )
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: string })?.error ??
        error.message ??
        "Failed to fetch room info"
      throw new Error(message)
    }
    throw error
  }
}

export async function leaveCustomRoom(): Promise<void> {
  try {
    await matchClient.delete("/api/match/custom-matching/leave")
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        (error.response?.data as { error?: string })?.error ??
        error.message ??
        "Failed to leave custom room"
      throw new Error(message)
    }
    throw error
  }
}