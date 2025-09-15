import prisma from "@bakugan-arena/prisma"
import { waitingListElements } from "../sockets/search-opponent"

export const CreateRoom = async({player1ID, P1Deck, Player2ID, P2Deck} : {player1ID: string, P1Deck: string, Player2ID: string, P2Deck: string}) => {
    return await prisma.rooms.create({
        data: {
            player1Id: player1ID,
            p1Deck: P1Deck,
            player2Id: Player2ID,
            p2Deck: P2Deck,
            looser: '',
            winner: '',
            finished: false
        }
    })
}