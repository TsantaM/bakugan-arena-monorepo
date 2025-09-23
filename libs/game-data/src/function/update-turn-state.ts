import { stateType } from "../type/room-types";

export function updateTurnState(roomData: stateType) {
    if(!roomData) return
    
    const { turnState, decksState, protalSlots } = roomData

    // Incrément du compteur de tours
    turnState.turnCount++

    // Détermination du joueur qui joue
    const players = decksState.map(d => d.userId)
    turnState.turn = players.find(p => p !== turnState.turn) ?? turnState.turn

    // Règles selon le nombre de tours
    if (turnState.turnCount === 2) {
        protalSlots[4].can_set = true
        turnState.set_new_bakugan = false
    } else {
        turnState.set_new_bakugan = true
        turnState.use_ability_card = true
        protalSlots.forEach(p => {
            if (!p.can_set && !p.portalCard) p.can_set = true
        })
    }
}