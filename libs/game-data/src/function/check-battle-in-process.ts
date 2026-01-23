import { type stateType } from '../../src/type/type-index.js'
import { CreateActionRequestFunction } from './create-action-request-function.js';
import { OnBattleStartAnimationDirectives } from './create-animation-directives/on-battle-start-animation-directives.js'


export const CheckBattle = ({ roomState }: { roomState: stateType }) => {

    if (roomState) {
        const slotWithTwoBakugans = structuredClone(roomState.protalSlots.find((s) => s.bakugans.length >= 2 && new Set(s.bakugans.map((b) => b.userId)).size >= 2));

        if (slotWithTwoBakugans && roomState && !roomState.battleState.battleInProcess && roomState.battleState.slot === null) {
            roomState.battleState = {
                ...roomState.battleState,
                battleInProcess: true,
                slot: slotWithTwoBakugans.id,
                turns: 2,
                paused: false
            }

            const firstBakuganOnSlotUserId = slotWithTwoBakugans.bakugans[0].userId
            const lastBakuganOnSlotUserId = slotWithTwoBakugans.bakugans[slotWithTwoBakugans.bakugans.length - 1].userId

            roomState.turnState = {
                ...roomState.turnState,
                set_new_bakugan: false,
                set_new_gate: false,
                use_ability_card: true,
                turn: lastBakuganOnSlotUserId,
                previous_turn: firstBakuganOnSlotUserId
            }

            OnBattleStartAnimationDirectives({
                animations: roomState.animations,
                slot: slotWithTwoBakugans
            })

            CreateActionRequestFunction({
                roomState: roomState
            })
        }
        else {

            const { battleInProcess, paused, slot } = roomState.battleState

            if ((!battleInProcess || !paused) && slot === null) return
            roomState.battleState = {
                ...roomState.battleState,
                battleInProcess: false,
                slot: null,
                paused: false,
            }

            roomState.animations.push({
                type: 'BATTLE-END',
                resolved: false
            })

        }

        if (roomState.battleState.battleInProcess && roomState.battleState.slot !== null) {
            const slotOfBattle = roomState.protalSlots.find((slot) => slot.id === roomState.battleState.slot)
            if (!slotOfBattle) return

            if (slotOfBattle.bakugans.length < 2) {
                roomState.battleState = {
                    ...roomState.battleState,
                    battleInProcess: false,
                    slot: null,
                    paused: false,
                }

                roomState.animations.push({
                    type: 'BATTLE-END',
                    resolved: false
                })
            }

        }

    }
}