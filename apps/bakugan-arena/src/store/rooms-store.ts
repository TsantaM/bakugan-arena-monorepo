// src/store/roomsStore.ts
import { create } from 'zustand'

export type Room = { p1: string, p2: string, roomId: string }

interface RoomsStore {
  rooms: Room[]
  setRooms: (newRooms: Room[]) => void
  addRoom: (room: Room) => void
  removeRoomById: (roomId: string) => void
  clearRooms: () => void
}

export const useRoomsStore = create<RoomsStore>((set) => ({
  rooms: [],
  setRooms: (newRooms) => set({ rooms: newRooms }),
  addRoom: (room) =>
    set((state) => {
      // On évite les doublons par roomId
      const exists = state.rooms.find((r) => r.roomId === room.roomId)
      if (exists) {
        return {
          rooms: state.rooms.map((r) =>
            r.roomId === room.roomId ? room : r
          ),
        }
      }
      return { rooms: [...state.rooms, room] }
    }),
  removeRoomById: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.roomId !== roomId),
    })),
  clearRooms: () => set({ rooms: [] }),
}))
