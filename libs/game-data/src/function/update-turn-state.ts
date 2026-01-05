import { type stateType } from "../type/room-types";

export function updateTurnState(roomData: stateType) {
    if (!roomData) return

    const { turnState, decksState, protalSlots } = roomData

    // Incrément du compteur de tours
    turnState.turnCount++

    // Détermination du joueur qui joue
    const players = decksState.map(d => d.userId)
    console.log('updateTurnState - Current turn:', turnState.can_change_player_turn)
    if (turnState.can_change_player_turn === true) {
        console.log('updateTurnState - Changing turn from', turnState.can_change_player_turn)
        turnState.previous_turn = turnState.turn
        turnState.turn = players.find(p => p !== turnState.turn) ?? turnState.turn
    }

    turnState.can_change_player_turn = true

    console.log('updateTurnState - New turn:', turnState)

    // Règles selon le nombre de tours
    if (turnState.turnCount > 0) {
        turnState.set_new_bakugan = true
        turnState.use_ability_card = true
        protalSlots.forEach(p => {
            if (!p.can_set && !p.portalCard) p.can_set = true
        })
    }

}