import { stateType } from '../../src/type/room-types'


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

            roomState.turnState = {
                ...roomState.turnState,
                set_new_bakugan: false,
                set_new_gate: false,
                use_ability_card: true
            }

        } else {
            if (roomState.turnState.turnCount === 2) {
                roomState.battleState.turns = 2
                roomState.turnState = {
                    ...roomState.turnState,
                    set_new_bakugan: false,
                    use_ability_card: false
                }

            } else {
                roomState.battleState.turns = 2
                roomState.turnState = {
                    ...roomState.turnState,
                    set_new_bakugan: true,
                    set_new_gate: true,
                    use_ability_card: true,
                }
            }
            roomState.battleState = {
                ...roomState.battleState,
                battleInProcess: false,
                slot: null,
                turns: 2,
                paused: false,
            }
        }
    }
}