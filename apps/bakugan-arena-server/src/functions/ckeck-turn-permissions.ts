import type { slots_id, stateType } from "@bakugan-arena/game-data";

export type responseTypes = {
    type: 'USE_ABILITY_CARD'
    abilityId: string;
    slot: slots_id;
    bakuganKey: string;
} | {
    type: 'SET_GATE_CARD_ACTION' | 'SELECT_GATE_CARD';
    slot: slots_id | undefined;
    gateId: string;

} | {
    type: 'SET_BAKUGAN'
    bakuganKey: string,
    slot: slots_id
} | {
    type: 'ACTIVE_GATE_CARD',
    gateId: string;
    slot: slots_id
}

export function CheckTurnPermissions({ roomState, userId, response }: { roomState: stateType, userId: string, response: responseTypes }): boolean {

    if (!roomState) return false
    const { turn, previous_turn, ability_card_block, can_change_player_turn, set_new_bakugan, set_new_gate, turnCount, use_ability_card } = roomState.turnState

    const players = roomState.players
    const player = players.find((p) => p.userId === userId)
    if (!player) return false

    const actions = turn === userId ? roomState.ActivePlayerActionRequest : roomState.InactivePlayerActionRequest
    const merged = [actions.actions.mustDo, actions.actions.mustDoOne, actions.actions.optional].flat()

    const action = merged.find((a) => a.type === response.type)
    if (!action) return false

    switch (response.type) {
        case "USE_ABILITY_CARD": {
            if (action.type !== 'USE_ABILITY_CARD') return false
            const { abilityId, bakuganKey } = response
            const bakugan = action.data.find((b) => b.bakuganKey === bakuganKey)
            if (!bakugan) return false
            const ability = bakugan.abilities.find((a) => a.key === abilityId)
            if (!ability) return false
        }
            break;

        case "SET_GATE_CARD_ACTION": {
            if (action.type !== 'SET_GATE_CARD_ACTION' && action.type !== 'SELECT_GATE_CARD') return false
            const { gateId, slot } = response

            if (action.type === 'SET_GATE_CARD_ACTION') {
                const card = action.data.cards.find((c) => c.key === gateId)
                if (!card) return false
                if (slot) {
                    if (!action.data.slots.includes(slot)) return false
                }
            }
            if(action.type === 'SELECT_GATE_CARD') {
                const card = action.data.find((c) => c.key === gateId)
                if (!card) return false
            }

        }
            break;

        case "SET_BAKUGAN": {
            if (action.type !== 'SET_BAKUGAN') return false
            const { bakuganKey, slot } = response
            const bakugan = action.data.bakugans.find((b) => b.key === bakuganKey)
            if (!bakugan) return false
            if (!action.data.setableSlots.includes(slot)) return false
        }
            break;

        case "ACTIVE_GATE_CARD": {
            if (action.type !== "ACTIVE_GATE_CARD") return false
            const { gateId, slot } = response
            const key = action.data.portalCard?.key
            if (!key) return false
            if (key !== gateId) return false
            if (action.data.id !== slot) return false
        }
            break;
    }


    return true

}