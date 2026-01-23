import { chalengeAcceptSocketProps, chalengeSomeoneSocketProps } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State, chalenges, connectedUsers } from "../game-state/battle-brawlers-game-state";
import { CreateRoom } from "../functions/create-room";
import { createGameState } from "../functions/create-game-state";
import { GetUsersRooms } from "../functions/get-rooms-of-user";

export const ChalengeSomeoneSocket = (io: Server, socket: Socket) => {
    socket.on('chalenge-someone', (data: chalengeSomeoneSocketProps) => {
        const { deckId, targetId, userId, chalengerName } = data

        const userSocket = connectedUsers.find((user) => user.userId === userId)?.socketId
        if (!userSocket) return

        const target = connectedUsers.find((user) => user.userId === targetId)

        if (!target) {
            socket.emit('no-player-found', {
                message: 'This user is not online'
            })
            return
        } else {

            const chalengeData = {
                chalengerName: chalengerName,
                chalengerId: userId
            }

            chalenges.push({
                chalenger: {
                    deckId: deckId,
                    userId: userId,
                    userSocket: userSocket
                },
                target: {
                    deckId: '',
                    userId: targetId,
                    userSocket: target.socketId
                }
            })


            io.to(target.socketId).emit('chalenge', chalengeData)
        }



    })
}

export const ChalengeAcceptSocket = (io: Server, socket: Socket) => {
    socket.on('chalenge-accept', async (data: chalengeAcceptSocketProps) => {
        const { chalengerId, deckId, userId } = data

        const chalenge = chalenges.find((chalenge) => chalenge.chalenger.userId === chalengerId && chalenge.target.userId === userId)
        const chalengeIndex = chalenges.findIndex((chalenge) => chalenge.chalenger.userId === chalengerId && chalenge.target.userId === userId)

        if (!chalenge) return
        if (!chalenges[chalengeIndex]) return

        chalenges[chalengeIndex].target.deckId = deckId


        const room = await CreateRoom({ player1ID: chalenges[chalengeIndex].chalenger.userId, P1Deck: chalenges[chalengeIndex].chalenger.deckId, Player2ID: chalenges[chalengeIndex].target.userId, P2Deck: chalenges[chalengeIndex].target.deckId })
        io.to(chalenges[chalengeIndex].chalenger.userSocket).emit('chalenge-accept-redirect', room.id)
        io.to(chalenges[chalengeIndex].target.userSocket).emit('chalenge-accept-redirect', room.id)

        const newRoomState = await createGameState({ roomId: room.id })

        if (newRoomState) {
            Battle_Brawlers_Game_State.push(newRoomState)
            const p1rooms = GetUsersRooms(chalenges[chalengeIndex].chalenger.userId)
            io.to(chalenges[chalengeIndex].chalenger.userSocket).emit('get-rooms-user-id', p1rooms)
            const p2rooms = GetUsersRooms(chalenges[chalengeIndex].target.userId)
            io.to(chalenges[chalengeIndex].target.userSocket).emit('get-rooms-user-id', p2rooms)
        }

        chalenges.splice(chalengeIndex, 1);

    })
}