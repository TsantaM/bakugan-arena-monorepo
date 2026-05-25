import { GateCards } from "../battle-brawlers/gate-gards.js";
import { AnimationDirectivesTypes, portalSlotsTypeElement, type stateType } from "../type/type-index.js";
import { RemoveGateCardDirectiveAnimation } from "./create-animation-directives/index.js";
import { GetUserName } from "./get-user-name.js";
import { ResetSlot } from "./reset-slot.js";

export const finalizeBattle = ({ roomData, winnerId, winners, loserId, loosers, slotToUpdate }: { roomData: stateType, winnerId?: string, winners?: { key: string, userId: string }[], loosers?: { key: string, userId: string }[], loserId?: string, slotToUpdate: portalSlotsTypeElement }) => {
    if (!roomData) return
    const { battleState, turnState } = roomData
    if (!battleState || battleState.slot === null) return

    if (winnerId && loserId) {
        roomData.turnState.turn = winnerId
        roomData.turnState.previous_turn = loserId
    } else {
        turnState.previous_turn = turnState.turn
        const players = roomData.players
        turnState.turn = players.find(p => p.userId !== roomData.turnState.turn)?.userId ?? turnState.turn
    }

    if (slotToUpdate.portalCard === null) return
    const card = GateCards[slotToUpdate.portalCard.key]

    if (!slotToUpdate.state.blocked && !slotToUpdate.state.open && card.activeOnBattleEnd && card.activeOnBattleEnd.autoActiveOnEnd && !card.activeOnBattleEnd.activeBeforeElimination) {
        const canAutoActivate = card.autoActivationCheck
            ? card.autoActivationCheck({ portalSlot: slotToUpdate, roomState: roomData, looser: loserId, winner: winnerId })
            : true

        if (canAutoActivate) {
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
            roomData.animationsForReplay.push(animation)


            card.onOpen({ roomState: roomData, slot: battleState.slot, looserId: loserId, winnerId: winnerId, winners: winners, loosers: loosers })

            slotToUpdate.state.open = true
        }
    }

    RemoveGateCardDirectiveAnimation({
        animations: roomData.animations,
        slot: slotToUpdate,
        roomState: roomData,
        animationsForReplay: roomData.animationsForReplay

    })

    if (slotToUpdate) ResetSlot(slotToUpdate)

    battleState.battleInProcess = false
    battleState.slot = null
    battleState.turns = 2
    battleState.paused = false
    turnState.set_new_gate = true
    turnState.set_new_bakugan = true

    const animation: AnimationDirectivesTypes = {
        type: 'BATTLE-END',
        resolved: false
    }
    roomData.animations.push(animation)
    roomData.animationsForReplay.push(animation)


}