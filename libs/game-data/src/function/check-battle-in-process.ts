import { type stateType } from '../../src/type/room-types'


export const CheckBattle = ({ roomState }: { roomState: stateType }) => {

    if (roomState) {
        const slotWithTwoBakugans = roomState.protalSlots.find((s) => s.bakugans.length >= 2)

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