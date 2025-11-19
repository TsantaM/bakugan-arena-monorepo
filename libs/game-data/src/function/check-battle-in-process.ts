import { type stateType } from '../../src/type/room-types'
import { OnBattleStartAnimationDirectives } from './create-animation-directives/on-battle-start-animation-directives'


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


        }
        else {
            roomState.battleState = {
                ...roomState.battleState,
                battleInProcess: false,
                slot: null,
                paused: false,
            }
        }
    }
}