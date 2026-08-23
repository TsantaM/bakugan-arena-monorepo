const inFlightRooms = new Set<string>()
const lastConsumedTurnCount = new Map<string, number>()

export function tryBeginTurnAdvance(roomId: string, turnCount: number): boolean {
    if (inFlightRooms.has(roomId)) return false
    if (lastConsumedTurnCount.get(roomId) === turnCount) return false
    inFlightRooms.add(roomId)
    return true
}

export function markTurnAdvanced(roomId: string, turnCount: number) {
    lastConsumedTurnCount.set(roomId, turnCount)
}

export function endTurnAdvance(roomId: string) {
    inFlightRooms.delete(roomId)
}

export function isTurnAdvanceInFlight(roomId: string): boolean {
    return inFlightRooms.has(roomId)
}

export function clearTurnAdvanceGuard(roomId: string) {
    inFlightRooms.delete(roomId)
    lastConsumedTurnCount.delete(roomId)
}
