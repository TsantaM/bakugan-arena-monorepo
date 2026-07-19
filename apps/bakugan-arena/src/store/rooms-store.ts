// src/store/roomsStore.ts
import { replayEntryType, replaySnapshotType } from '@bakugan-arena/game-data'
import { create } from 'zustand'

export type Room = {
    p1: string
    p2: string
    roomId: string
    finished: boolean
    replay?: replayEntryType[]
    initialSnapshot?: replaySnapshotType
}

interface RoomsStore {
  rooms: Room[]
  dismissedRoomIds: string[]
  setRooms: (newRooms: Room[]) => void
  addRoom: (room: Room) => void
  updateRoom: (room: Room) => void
  removeRoomById: (roomId: string) => void
  dismissRoom: (roomId: string) => void
  clearRooms: () => void
}

export const useRoomsStore = create<RoomsStore>((set) => ({
  rooms: [],
  dismissedRoomIds: [],
  setRooms: (newRooms) =>
    set((state) => ({
      rooms: newRooms.filter((r) => !state.dismissedRoomIds.includes(r.roomId)),
    })),
  updateRoom: (room) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.roomId === room.roomId
          ? {
            ...r,
            ...room,
          }
          : r
      ),
    })),
  addRoom: (room) =>
    set((state) => {
      if (state.dismissedRoomIds.includes(room.roomId)) {
        return state
      }
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
  dismissRoom: (roomId) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.roomId !== roomId),
      dismissedRoomIds: state.dismissedRoomIds.includes(roomId)
        ? state.dismissedRoomIds
        : [...state.dismissedRoomIds, roomId],
    })),
  clearRooms: () => set({ rooms: [], dismissedRoomIds: [] }),
}))
