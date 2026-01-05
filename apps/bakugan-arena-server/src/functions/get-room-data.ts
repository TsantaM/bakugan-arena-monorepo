import prisma from "@bakugan-arena/prisma"

export const getDecksDataPrisma = async ({ roomId }: { roomId: string }) => {
    const roomData = await prisma.rooms.findUnique({
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

    if (roomData) {
        const players = [roomData.player1Id, roomData.player2Id]
        const decksIds = [roomData.p1Deck, roomData.p2Deck]
        const getDecksData = await prisma.deck.findMany({
            where: {
                id: {
                    in: decksIds
                },
                userId: {
                    in: players
                }
            },
            select: {
                id: true,
                userId: true,
                bakugans: true,
                ability: true,
                exclusiveAbilities: true,
                gateCards: true
            }
        })

        return getDecksData
    }

}

export type getDecksDataPrismaType = Exclude<Awaited<ReturnType<typeof getDecksDataPrisma>>, undefined>


export const getRoomPlayers = async ({ roomId }: { roomId: string }) => {
    const room = await prisma.rooms.findUnique({
        where: {
            id: roomId
        },
        select: {
            player1Id: true,
            player2Id: true
        }
    })

    if (room && room != null) {
        const player1 = await prisma.user.findUnique({
            where: {
                id: room.player1Id
            },
            select: {
                id: true,
                displayUsername: true
            }
        })

        const player2 = await prisma.user.findUnique({
            where: {
                id: room.player2Id
            },
            select: {
                id: true,
                displayUsername: true
            }
        })

        return {
            "player1": {
                player1
            },

            "player2": {
                player2
            }
        }
    }

}

export type getRoomPlayersType = Exclude<Awaited<ReturnType<typeof getRoomPlayers>>, undefined>