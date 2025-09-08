import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export const CheckBattle = ({ roomId }: { roomId: string }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    if (roomData) {
        const slotWithTwoBakugans = roomData.protalSlots.find((s) => s.bakugans.length === 2)

        if (slotWithTwoBakugans && Battle_Brawlers_Game_State[roomIndex]) {
            Battle_Brawlers_Game_State[roomIndex].battleState = {
                ...Battle_Brawlers_Game_State[roomIndex].battleState,
                battleInProcess: true,
                slot: slotWithTwoBakugans.id,
                turns: 2,
                paused: false
            }
            Battle_Brawlers_Game_State[roomIndex].turnState.set_new_bakugan = false
            Battle_Brawlers_Game_State[roomIndex].turnState.set_new_gate = false
            Battle_Brawlers_Game_State[roomIndex].turnState.use_ability_card = true
            
        } else {
            return
        }
    }
}