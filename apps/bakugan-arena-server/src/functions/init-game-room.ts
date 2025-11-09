import { roomStateType } from "@bakugan-arena/game-data/src/type/room-types"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

const initRoomState: ({roomId} : {roomId: string}) => roomStateType | undefined = ({ roomId }: { roomId: string }) => {
    
    const data = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    if (!data) return

    const deck = data.decksState
    const turnState = data.turnState
    const portalSlots = data.protalSlots
    const battleState = data.battleState

    return {
        turnState,
        deck,
        portalSlots,
        battleState
    }

}


export { initRoomState }