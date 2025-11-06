import { create } from "zustand"
import { persist } from "zustand/middleware"

type RoomState = {
  roomId: string | null
  setRoomId: (id: string) => void
  clearRoomId: () => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      roomId: null,
      setRoomId: (id) => set({ roomId: id }),
      clearRoomId: () => set({ roomId: null }),
    }),
    {
      name: "room-storage", // key in localStorage
    }
  )
)