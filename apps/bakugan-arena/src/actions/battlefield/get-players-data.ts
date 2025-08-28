'use server'

import prisma from "@bakugan-arena/prisma"

export const RoomDataAction = async (roomId: string) => {
    const room = await prisma.rooms.findUnique({
        where: {
            id: roomId
        },
        select: {
            player1Id: true,
            p1Deck: true,
            player2Id: true,
            p2Deck: true
        }
    })

    if (room != null) {
        const player1 = await prisma.user.findUnique({
            where: {
                id: room.player1Id
            },
            select: {
                image: true,
                displayUsername: true,
                id: true
            }
        })

        const deckP1 = await prisma.deck.findUnique({
            where: {
                id: room.p1Deck
            },
            select: {
                bakugans: true,
                ability: true,
                exclusiveAbilities: true,
                gateCards: true
            }
        })

        const player2 = await prisma.user.findUnique({
            where: {
                id: room.player2Id
            },
            select: {
                image: true,
                displayUsername: true,
                id: true
            }
        })

        const deckP2 = await prisma.deck.findUnique({
            where: {
                id: room.p2Deck
            },
            select: {
                bakugans: true,
                ability: true,
                exclusiveAbilities: true,
                gateCards: true
            }
        })

        if (player1 && player2 && deckP1 && deckP2) {
            const roomData = [{
                player: player1,
                deck: deckP1
            },
            {
                player: player2,
                deck: deckP2
            }]

            return roomData
        }
    }
}

export type RoomDataActionType = Exclude<Awaited<ReturnType<typeof RoomDataAction>>, undefined>
