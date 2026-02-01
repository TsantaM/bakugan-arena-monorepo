import { ActionType, stateType } from '../../type/type-index.js'
import { FindUsableSlotAndGates } from '../filters/set-gate-card-filters.js'
import { GateCardsList } from '../../battle-brawlers/gate-gards.js'


export function SetGateCardActionRequest({ roomState }: { roomState: stateType }) {
    if (!roomState) return

    const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
    const battleState = roomState.battleState
    const turnCount = roomState.turnState.turnCount

    if (!activePlayer) return
    const usableGatesCount: number = roomState.players.find((player) => player.userId === activePlayer?.userId)?.usable_gates || 0
    const usableBakugans: number = activePlayer.bakugans.filter((b) => !b?.bakuganData.elimined && !b?.bakuganData.onDomain).length || 0

    if (usableGatesCount === 0) return

    const { usableGates, usableSlots } = FindUsableSlotAndGates({
        gates: activePlayer.gates,
        slots: roomState.protalSlots
    })


    if (!usableGates) return
    if (!usableSlots) return

    const setGateCardRequest: ActionType = {
        type: 'SET_GATE_CARD_ACTION',
        data: {
            cards: usableGates.map((card) => ({
                key: card.key,
                name: card.name,
                description: card.description,
                image: GateCardsList.find((gate) => gate.key === card.key)?.image || ''
            })),
            slots: usableSlots.map((slot) => slot.id),
        }
    }

    if (turnCount > 0 && (!battleState.battleInProcess || battleState.paused) && usableBakugans > 0) {
        if (usableSlots.length > 0 && usableGates.length > 0) {
            const request = roomState.ActivePlayerActionRequest
            request.actions.optional.push(setGateCardRequest)
        } else {
            return
        }

    } else {
        return
    }


}

export function SelectGateCardActionRequest({ roomState }: { roomState: stateType }) {
    if (!roomState) return
    const activePlayer = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
    const inactivePlayer = roomState.decksState.find((deck) => deck.userId !== roomState.turnState.turn)
    const battleState = roomState.battleState
    const turnCount = roomState.turnState.turnCount
    const active = roomState.ActivePlayerActionRequest
    const inactive = roomState.InactivePlayerActionRequest

    if (!activePlayer) return
    if (!inactivePlayer) return

    const usableGatesCount: number = roomState.players.find((player) => player.userId === activePlayer?.userId)?.usable_gates || 0

    if (usableGatesCount === 0) return

    const { usableGates } = FindUsableSlotAndGates({
        gates: activePlayer.gates,
        slots: roomState.protalSlots
    })

    const { usableGates: inactivesPlayerGates } = FindUsableSlotAndGates({
        gates: inactivePlayer.gates,
        slots: roomState.protalSlots
    })

    if (!usableGates) return

    const selectGateCardRequest: ActionType = {
        type: 'SELECT_GATE_CARD',
        data: usableGates.map((card) => ({
            key: card.key,
            name: card.name,
            description: card.description,
            image: GateCardsList.find((gate) => gate.key === card.key)?.image || ''
        }))
    }

    if (!inactivesPlayerGates) return

    const inactivePlayerSelectGateCardRequest: ActionType = {
        type: 'SELECT_GATE_CARD',
        data: inactivesPlayerGates.map((card) => ({
            key: card.key,
            name: card.name,
            description: card.description,
            image: GateCardsList.find((gate) => gate.key === card.key)?.image || ''
        }))
    }

    if (turnCount === 0) {
        if (usableGates.length > 0) {
            active.actions.mustDo.push(selectGateCardRequest)
        }
        if (inactivesPlayerGates.length > 0) {
            inactive.actions.mustDo.push(inactivePlayerSelectGateCardRequest)
        }
    } else {
        if (!battleState.battleInProcess || battleState.paused) {
            const cardOnBoard = roomState.protalSlots.filter((slot) => slot.portalCard !== null && !slot.can_set)
            if (cardOnBoard.length === 0 && usableGates.length > 0) {
                active.actions.mustDo.push(selectGateCardRequest)
            }
        }
    }

}