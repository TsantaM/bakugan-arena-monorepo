import { roomStateType } from "@bakugan-arena/game-data/src/type/room-types"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { Message } from "@bakugan-arena/game-data/src/type/animations-directives"

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

        let finished: Message | undefined = undefined

        if (data.status.finished) {


            if (data.status.winner !== null) {
                const winner = data.players.find((p) => p.userId === data.status.winner)?.username ? data.players.find((p) => p.userId === data.status.winner)?.username : ''

                finished = {
                    text: `Combat terminé ! Vainceur ${winner}`
                }

            } else {
                finished = {
                    text: `Combat terminé ! Match Null !`
                }
            }

        }



        return {
            turnState,
            deck,
            portalSlots,
            battleState,
            eliminated: {
                user: usersBakugans ? usersBakugans : 0,
                opponnent: opponentBakugans ? opponentBakugans : 0
            },
            finished: finished
    }

    }


export { initRoomState }