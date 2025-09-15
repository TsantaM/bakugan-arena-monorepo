import { stateType } from '../../src/type/room-types'
import prisma from "@bakugan-arena/prisma"


export const CheckGameFinished = async ({ roomId, roomState }: { roomId: string, roomState: stateType }) => {

    if (roomState && roomState.status.finished === false && roomState.status.winner === null) {
        const player1 = roomState.players[0].userId
        const p1Decks = roomState.decksState.find((d) => d.userId === player1)
        const player2 = roomState.players[1].userId
        const p2Decks = roomState.decksState.find((d) => d.userId === player2)

        if (p1Decks && p2Decks) {

            const p1State = p1Decks.bakugans.reduce((count, b) => {
                return (b?.bakuganData?.elimined === false) ? count + 1 : count
            }, 0)

            const p2State = p2Decks.bakugans.reduce((count, b) => {
                return (b?.bakuganData?.elimined === false) ? count + 1 : count
            }, 0)

            console.log(`Player 1 : ${p1State} && Player 2 : ${p2State}`)

            if (p1State === 0 && p2State > 0) {
                roomState.status.finished = true
                roomState.status.winner = player2

                await prisma.rooms.update({
                    where: {
                        id: roomId
                    },
                    data: {
                        winner: player2,
                        finished: true,
                        looser: player1
                    }
                })

            } else if (p1State > 0 && p2State === 0) {
                roomState.status.finished = true
                roomState.status.winner = player1

                await prisma.rooms.update({
                    where: {
                        id: roomId
                    },
                    data: {
                        winner: player1,
                        finished: true,
                        looser: player2
                    }
                })

            } else if (p1State === 0 && p2State === 0) {
                roomState.status.finished = true,
                    roomState.status.winner = null

                await prisma.rooms.update({
                    where: {
                        id: roomId
                    },
                    data: {
                        finished: true,
                    }
                })
            } else if (p1State > 0 && p2State > 0) {
                return
            } else {
                return
            }
        }

    }
}