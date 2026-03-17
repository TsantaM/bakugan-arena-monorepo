import { GateCardsList } from "../battle-brawlers/gate-gards.js";
import { AnimationDirectivesTypes, type stateType } from "../type/type-index.js";
import { RemoveGateCardDirectiveAnimation } from "./create-animation-directives/index.js";
import { GetUserName } from "./get-user-name.js";
import { ResetSlot } from "./reset-slot.js";

export const finalizeBattle = ({ roomData, winnerId, winners, loserId, loosers }: { roomData: stateType, winnerId?: string, winners: { key: string, userId: string }[], loosers: { key: string, userId: string }[], loserId?: string }) => {
    if (!roomData) return
    const { battleState, protalSlots, turnState } = roomData
    if (!battleState || !protalSlots || !turnState || battleState.slot === null) return

    const slotToUpdate = protalSlots.find((s) => s.id === battleState.slot)

    if (winnerId && loserId) {
        roomData.turnState.turn = winnerId
        roomData.turnState.previous_turn = loserId

    }

    if (!slotToUpdate) return


    const card = GateCardsList.find((c) => c.key === slotToUpdate.portalCard?.key)
    if (!card) return

    if (!slotToUpdate.state.blocked && !slotToUpdate.state.open && card.activeOnBattleEnd && card.activeOnBattleEnd.autoActiveOnEnd && !card.activeOnBattleEnd.activeBeforeElimination) {

        if(card.autoActivationCheck && !card.autoActivationCheck({portalSlot: slotToUpdate, roomState: roomData, looser: loserId, winner: winnerId})) return

        const animation: AnimationDirectivesTypes = {
            type: "OPEN_GATE_CARD",
            data: {
                slot: structuredClone(slotToUpdate),
                slotId: structuredClone(slotToUpdate).id
            },
            resolved: false,
            message: [{
                text: `Gate Card Open ! ${card.name}`,
                userName: GetUserName({ roomData: roomData, userId: slotToUpdate.portalCard?.userId || '' }),
                turn: roomData.turnState.turnCount
            },
            {
                text: `${card.description}`,
                turn: roomData.turnState.turnCount,
                description: true
            }]
        }

        roomData.animations.push(animation)

        card.onOpen({ roomState: roomData, slot: battleState.slot, looserId: loserId, winnerId: winnerId, winners: winners, loosers: loosers })

        slotToUpdate.state.open
        
    }

    RemoveGateCardDirectiveAnimation({
        animations: roomData.animations,
        slot: slotToUpdate
    })

    if (slotToUpdate) ResetSlot(slotToUpdate)

    battleState.battleInProcess = false
    battleState.slot = null
    battleState.turns = 2
    battleState.paused = false
    turnState.set_new_gate = true
    turnState.set_new_bakugan = true

    roomData.animations.push({
        type: 'BATTLE-END',
        resolved: false
    })

}