import { CancelChalengeSocketPropsType, chalengeAcceptRedirectProps, chalengeAcceptSocketProps, chalengeSomeoneSocketProps, RejectChalengeSocketPropsType } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State, connectedUsers, intervalIds } from "../game-state/battle-brawlers-game-state";
import { CreateRoom } from "../functions/create-room";
import { createGameState } from "../functions/create-game-state";
import { GetUsersRooms } from "../functions/get-rooms-of-user";

type Challenge = {
    chalenger: {
        userId: string
        deckId: string
    }
    target: {
        userId: string
        deckId: string | null
    }
    createdAt: number
}

const challenges = new Map<string, Challenge>()

const getKey = (chalengerId: string, targetId: string) => {
    return `${chalengerId}:${targetId}`
}

const getReverseKey = (chalengerId: string, targetId: string) => {
    return `${targetId}:${chalengerId}`
}


class ChallengeService {

    static create({ chalengerId, targetId, deckId }: {
        chalengerId: string
        targetId: string
        deckId: string
    }) {

        const key = getKey(chalengerId, targetId)
        const reverseKey = getReverseKey(chalengerId, targetId)

        // ❌ empêche doublons + inversés
        if (challenges.has(key) || challenges.has(reverseKey)) return null

        const challenge: Challenge = {
            chalenger: { userId: chalengerId, deckId },
            target: { userId: targetId, deckId: null },
            createdAt: Date.now()
        }

        challenges.set(key, challenge)

        // ⏳ expiration auto (30s)
        setTimeout(() => {
            challenges.delete(key)
        }, 30000)

        return challenge
    }

    static accept({ chalengerId, targetId, deckId }: {
        chalengerId: string
        targetId: string
        deckId: string
    }) {

        const key = getKey(chalengerId, targetId)
        const challenge = challenges.get(key)

        if (!challenge) return null

        // 🔥 suppression atomique
        challenges.delete(key)

        challenge.target.deckId = deckId

        return challenge
    }

    static cancel({ chalengerId, targetId }: {
        chalengerId: string
        targetId: string
    }) {

        const key = getKey(chalengerId, targetId)
        const challenge = challenges.get(key)

        if (!challenge) return null

        challenges.delete(key)

        return challenge
    }

    static reject({ chalengerId, targetId }: {
        chalengerId: string
        targetId: string
    }) {

        const key = getKey(chalengerId, targetId)
        const challenge = challenges.get(key)

        if (!challenge) return null

        challenges.delete(key)

        return challenge
    }
}


export const ChalengeSomeoneSocket = (io: Server, socket: Socket) => {
    socket.on('chalenge-someone', (data: chalengeSomeoneSocketProps) => {

        const { deckId, targetId, userId, chalengerName } = data

        const target = connectedUsers.find(u => u.userId === targetId)
        if (!target) {
            socket.emit('no-player-found', { message: 'This user is not online' })
            return
        }

        const challenge = ChallengeService.create({
            chalengerId: userId,
            targetId,
            deckId
        })

        if (!challenge) return // doublon bloqué

        io.to(target.socketId).emit('chalenge', {
            chalengerName,
            chalengerId: userId
        })
    })
}

export const ChalengeAcceptSocket = (io: Server, socket: Socket) => {
    socket.on('chalenge-accept', async (data: chalengeAcceptSocketProps) => {

        const { chalengerId, deckId, userId } = data

        if (!userId) return

        const challenge = ChallengeService.accept({
            chalengerId,
            targetId: userId,
            deckId
        })

        if (!challenge) return

        const room = await CreateRoom({
            player1ID: challenge.chalenger.userId,
            P1Deck: challenge.chalenger.deckId,
            Player2ID: challenge.target.userId,
            P2Deck: challenge.target.deckId!
        })

        const newRoomState = await createGameState({
            roomId: room.id,
            ranked: false
        })

        if (!newRoomState) return

        Battle_Brawlers_Game_State.push(newRoomState)

        intervalIds.push({
            roomId: newRoomState.roomId,
            players: newRoomState.players.map(p => ({
                userId: p.userId,
                intervalId: null
            }))
        })

        const chalengerSocket = connectedUsers.find(u => u.userId === challenge.chalenger.userId)?.socketId
        const targetSocket = connectedUsers.find(u => u.userId === challenge.target.userId)?.socketId

        if (!chalengerSocket || !targetSocket) return

        io.to(chalengerSocket).emit('match-found', newRoomState.roomId)
        io.to(targetSocket).emit('match-found', newRoomState.roomId)

        const p1rooms = GetUsersRooms(challenge.chalenger.userId)
        const p2rooms = GetUsersRooms(challenge.target.userId)

        io.to(chalengerSocket).emit('get-rooms-user-id', p1rooms)
        io.to(targetSocket).emit('get-rooms-user-id', p2rooms)
    })
}

export const CancelChalengeSocket = (io: Server, socket: Socket) => {

    socket.on('cancel-chalenge', ({ targetId, userId }: CancelChalengeSocketPropsType) => {

        const challenge = ChallengeService.cancel({
            chalengerId: userId,
            targetId
        })

        if (!challenge) return

        const targetSocket = connectedUsers.find(u => u.userId === targetId)?.socketId
        if (!targetSocket) return

        io.to(targetSocket).emit('chalenge-canceled', userId)
    })
}

export const RejectChalengeSocket = (io: Server, socket: Socket) => {

    socket.on('chalenge-rejected', ({ chalengerId, userId }: RejectChalengeSocketPropsType) => {

        const challenge = ChallengeService.reject({
            chalengerId,
            targetId: userId
        })

        if (!challenge) return

        const chalengerSocket = connectedUsers.find(u => u.userId === chalengerId)?.socketId
        if (!chalengerSocket) return

        io.to(chalengerSocket).emit('chalenge-rejected', userId)
    })
}