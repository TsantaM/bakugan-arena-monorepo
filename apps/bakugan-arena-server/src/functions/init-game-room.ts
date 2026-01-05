import { roomStateType } from "@bakugan-arena/game-data/src/type/room-types"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

const initRoomState: 
({ roomId, userId }: { roomId: string, userId: string }) => roomStateType | undefined = 

({ roomId, userId }: { roomId: string, userId: string }) => {

    const data = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    if (!data) return

    const deck = data.decksState
    const turnState = data.turnState
    const portalSlots = data.protalSlots
    const battleState = data.battleState

    const usersBakugans = deck.find((d) => d.userId === userId)?.bakugans.map((b) => b?.bakuganData).filter((bakugan) => bakugan !== undefined).filter((b) => b.elimined).length

    const opponentBakugans = deck.find((d) => d.userId !== userId)?.bakugans.map((b) => b?.bakuganData).filter((bakugan) => bakugan !== undefined).filter((b) => b.elimined).length

    console.log('init-state', userId, usersBakugans, opponentBakugans)

    return {
        turnState,
        deck,
        portalSlots,
        battleState,
        eliminated: {
            user: usersBakugans ? usersBakugans : 0,
            opponnent: opponentBakugans ? opponentBakugans : 0
        }
    }

}


export { initRoomState }