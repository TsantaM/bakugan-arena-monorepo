import { stateType } from '@bakugan-arena/game-data'
import { PrismaClient } from '../../generated/prisma/client.js'

const prisma = new PrismaClient()

export const CheckGameFinished = async ({ roomId, roomState }: { roomId: string, roomState: stateType }) => {

    if (roomState && roomState.status.finished === false) {
        const player1 = roomState.players[0].userId
        const p1Decks = roomState.decksState.find((d) => d.userId === player1)
        const player2 = roomState.players[1].userId
        const p2Decks = roomState.decksState.find((d) => d.userId === player2)

        const gateOnDomain = roomState.protalSlots.filter((s) => s.portalCard !== null)
        const p1Gates = roomState.players.find((p) => p.userId === player1)?.usable_gates
        const p2Gates = roomState.players.find((p) => p.userId === player2)?.usable_gates

        console.log('gate on domain' , gateOnDomain.length)
        console.log('p1Gates', p1Gates)
        console.log('p2Gates', p2Gates)
        const nullVerify = gateOnDomain.length === 0 && p1Gates === 0 && p2Gates === 0 ? true : false
        console.log('null verify' , nullVerify)

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
            } else if (gateOnDomain.length === 0 && p1Gates === 0 && p2Gates === 0) {

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