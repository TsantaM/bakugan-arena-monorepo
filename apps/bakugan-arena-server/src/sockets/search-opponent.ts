import { Server, Socket } from "socket.io";
import { CreateRoom } from "../functions/create-room";
import { createGameState } from "../functions/create-game-state";
import { Battle_Brawlers_Game_State, intervalIds } from "../game-state/battle-brawlers-game-state";
import { GetUsersRooms } from "../functions/get-rooms-of-user";

export type waitingListElements = {
    socketId: string,
    userId: string,
    deckId: string
}


let waitingList: waitingListElements[] = []


// ADD TO WAITING LIST FUNCTION

const addToWaitingList = ({ userId, deckId, socketId }: { userId: string, deckId: string, socketId: string }) => {
    const newEntry: waitingListElements = {
        socketId: socketId,
        userId: userId,
        deckId: deckId
    }

    const ckeckExist = waitingList.some(w => w.userId === userId)

    if (!ckeckExist) {
        waitingList.push(newEntry)
        console.log(`User ${userId} added to waiting list.`)

    } else {
        console.log(`User ${userId} is already in the waiting list.`)
    }

}

export const removeToWaitingList = ({ userId }: { userId: string }) => {
    waitingList = waitingList.filter(w => w.userId !== userId)
    console.log(`User ${userId} removed from waiting list.`)
    console.log(waitingList)
}

const matchmaking = async ({ io, socket, socketId, userId }: { io: Server, socket: Socket, socketId: string, userId: string }) => {

    const player1 = waitingList.find(w => w.socketId === socketId)

    if (player1) {
        if (waitingList.length > 2) {
            const player2Candidates = waitingList.filter(w => w.userId !== userId)
            if (player2Candidates.length > 0) {
                const player2 = player2Candidates[Math.floor(Math.random() * player2Candidates.length)]

                // Requete Prisma qui va inserer la nouvelle room dans la BDD
                const players = [player1, player2]
                const room = await CreateRoom({ player1ID: player1.userId, P1Deck: player1.deckId, Player2ID: player2.userId, P2Deck: player2.deckId })

                removeToWaitingList({ userId: player1.userId })
                removeToWaitingList({ userId: player2.userId })

                const newRoomState = await createGameState({ roomId: room.id })
                if (newRoomState) {
                    const playersInvervalsId = newRoomState.players.map((player) => ({
                        userId: player.userId,
                        intervalId: null
                    }))
                    const interval = {
                        roomId: newRoomState.roomId,
                        players: playersInvervalsId
                    }
                    Battle_Brawlers_Game_State.push(newRoomState)

                    intervalIds.push(interval)
                }


            } else {
                console.log(`No suitable opponent found for ${player1.userId}`)
            }

        } else {

            const player2 = waitingList.find(w => w.userId !== userId)
            if (player2) {
                console.log(`Match found between ${player1.userId} and ${player2.userId}`)

                const players = [player1, player2]
                const room = await CreateRoom({ player1ID: player1.userId, P1Deck: player1.deckId, Player2ID: player2.userId, P2Deck: player2.deckId })

                players.forEach((p) => io.to(p.socketId).emit('match-found', room.id))
                players.forEach((p) => removeToWaitingList({ userId: p.userId }))

                const newRoomState = await createGameState({ roomId: room.id })

                if (newRoomState) {
                    const playersInvervalsId = newRoomState.players.map((player) => ({
                        userId: player.userId,
                        intervalId: null
                    }))
                    const interval = {
                        roomId: newRoomState.roomId,
                        players: playersInvervalsId
                    }
                    Battle_Brawlers_Game_State.push(newRoomState)

                    intervalIds.push(interval)

                    players.forEach((p) => {
                        const rooms = GetUsersRooms(p.userId)
                        io.to(p.socketId).emit('get-rooms-user-id', rooms)
                    })
                }

            }
        }
    }

}
// SOCKET ADD TO WAITING LIST

export const setupSearchOpponentSocket = (io: Server, socket: Socket) => {
    socket.on('search-opponent', ({ userId, deckId }: { userId: string, deckId: string }) => {
        addToWaitingList({ userId, deckId, socketId: socket.id })
        matchmaking({ io, socket, socketId: socket.id, userId })
    })
}