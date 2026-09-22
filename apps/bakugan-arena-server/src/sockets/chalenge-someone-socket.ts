import {
    CancelChalengeSocketPropsType,
    ChalengeEndedSocketProps,
    ChalengeFailedSocketProps,
    chalengeAcceptRedirectProps,
    chalengeAcceptSocketProps,
    chalengeSomeoneSocketProps,
    RejectChalengeSocketPropsType,
} from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io";
import { Battle_Brawlers_Game_State, connectedUsers, intervalIds } from "../game-state/battle-brawlers-game-state";
import { CreateRoom } from "../functions/create-room";
import { createGameState } from "../functions/create-game-state";
import { GetUsersRooms } from "../functions/get-rooms-of-user";
import { syncClocks } from "../functions/start-player-timer";
import { assertActor } from "./assert-actor";

const CHALLENGE_TTL_MS = 30_000

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
    /** Annulé dès que le défi est résolu, pour ne pas notifier une expiration fantôme. */
    expiry: NodeJS.Timeout
}

const challenges = new Map<string, Challenge>()

const getKey = (chalengerId: string, targetId: string) => {
    return `${chalengerId}:${targetId}`
}

const getReverseKey = (chalengerId: string, targetId: string) => {
    return `${targetId}:${chalengerId}`
}

function socketOf(userId: string): string | undefined {
    return connectedUsers.find((u) => u.userId === userId)?.socketId
}

/** Notifie les deux joueurs qu'un défi s'est terminé sans réponse. */
function emitChalengeEnded(io: Server, challenge: Challenge, reason: ChalengeEndedSocketProps['reason']) {
    const payload: ChalengeEndedSocketProps = {
        chalengerId: challenge.chalenger.userId,
        targetId: challenge.target.userId,
        reason,
    }

    for (const userId of [challenge.chalenger.userId, challenge.target.userId]) {
        const socketId = socketOf(userId)
        if (socketId) io.to(socketId).emit('chalenge-ended', payload)
    }
}

class ChallengeService {

    /** Retire le défi de la map et désarme son expiration. */
    private static take(key: string): Challenge | null {
        const challenge = challenges.get(key)
        if (!challenge) return null

        clearTimeout(challenge.expiry)
        challenges.delete(key)

        return challenge
    }

    static create({ chalengerId, targetId, deckId, io }: {
        chalengerId: string
        targetId: string
        deckId: string
        io: Server
    }): { challenge: Challenge } | { error: ChalengeFailedSocketProps['reason'] } {

        if (chalengerId === targetId) return { error: 'SELF' }

        const key = getKey(chalengerId, targetId)
        const reverseKey = getReverseKey(chalengerId, targetId)

        // ❌ empêche doublons + inversés
        if (challenges.has(key) || challenges.has(reverseKey)) return { error: 'ALREADY_PENDING' }

        const challenge: Challenge = {
            chalenger: { userId: chalengerId, deckId },
            target: { userId: targetId, deckId: null },
            createdAt: Date.now(),
            // ⏳ expiration auto — les deux UI doivent en être informées, sinon
            // elles restent bloquées sur « en attente de réponse ».
            expiry: setTimeout(() => {
                const expired = challenges.get(key)
                if (!expired) return
                challenges.delete(key)
                emitChalengeEnded(io, expired, 'EXPIRED')
            }, CHALLENGE_TTL_MS),
        }

        challenges.set(key, challenge)

        return { challenge }
    }

    static accept({ chalengerId, targetId, deckId }: {
        chalengerId: string
        targetId: string
        deckId: string
    }) {
        const challenge = ChallengeService.take(getKey(chalengerId, targetId))
        if (!challenge) return null

        challenge.target.deckId = deckId

        return challenge
    }

    static cancel({ chalengerId, targetId }: { chalengerId: string, targetId: string }) {
        return ChallengeService.take(getKey(chalengerId, targetId))
    }

    static reject({ chalengerId, targetId }: { chalengerId: string, targetId: string }) {
        return ChallengeService.take(getKey(chalengerId, targetId))
    }

    /** Défis impliquant ce joueur, retirés et renvoyés (déconnexion). */
    static takeAllFor(userId: string): Challenge[] {
        const taken: Challenge[] = []

        for (const [key, challenge] of [...challenges.entries()]) {
            if (challenge.chalenger.userId !== userId && challenge.target.userId !== userId) continue
            const removed = ChallengeService.take(key)
            if (removed) taken.push(removed)
        }

        return taken
    }
}


export const ChalengeSomeoneSocket = (io: Server, socket: Socket) => {
    socket.on('chalenge-someone', (data: chalengeSomeoneSocketProps) => {

        const { deckId, targetId, userId, chalengerName } = data

        if (!assertActor(socket, userId, 'chalenge-someone')) return

        const fail = (reason: ChalengeFailedSocketProps['reason']) => {
            const payload: ChalengeFailedSocketProps = { targetId, reason }
            socket.emit('chalenge-failed', payload)
        }

        const target = connectedUsers.find(u => u.userId === targetId)
        if (!target) {
            socket.emit('no-player-found', { key: 'user_offline', message: 'This user is not online' })
            fail('TARGET_OFFLINE')
            return
        }

        const created = ChallengeService.create({
            chalengerId: userId,
            targetId,
            deckId,
            io,
        })

        // Sans retour, le challenger resterait bloqué sur « en attente de réponse »
        if ('error' in created) {
            fail(created.error)
            return
        }

        io.to(target.socketId).emit('chalenge', {
            chalengerName,
            chalengerId: userId
        })
    })

    socket.on('disconnect', () => {
        const userId = socket.handshake.auth?.userId as string | undefined
        if (!userId) return

        // Un défi dont un des deux joueurs a disparu ne doit pas rester ouvert :
        // l'autre pourrait l'accepter et créer une room fantôme.
        for (const challenge of ChallengeService.takeAllFor(userId)) {
            emitChalengeEnded(io, challenge, 'DISCONNECTED')
        }
    })
}

export const ChalengeAcceptSocket = (io: Server, socket: Socket) => {
    socket.on('chalenge-accept', async (data: chalengeAcceptSocketProps) => {

        const { chalengerId, deckId, userId } = data

        if (!userId) return
        if (!assertActor(socket, userId, 'chalenge-accept')) return

        const challenge = ChallengeService.accept({
            chalengerId,
            targetId: userId,
            deckId
        })

        if (!challenge) {
            // Défi expiré ou déjà résolu entre-temps
            const payload: ChalengeEndedSocketProps = {
                chalengerId,
                targetId: userId,
                reason: 'EXPIRED',
            }
            socket.emit('chalenge-ended', payload)
            return
        }

        const chalengerSocket = socketOf(challenge.chalenger.userId)
        const targetSocket = socketOf(challenge.target.userId)

        // Vérifié AVANT de créer la room : sinon on laissait une partie fantôme
        // en base et en mémoire que personne ne pouvait rejoindre.
        if (!chalengerSocket || !targetSocket) {
            emitChalengeEnded(io, challenge, 'DISCONNECTED')
            return
        }

        const room = await CreateRoom({
            player1ID: challenge.chalenger.userId,
            P1Deck: challenge.chalenger.deckId,
            Player2ID: challenge.target.userId,
            P2Deck: challenge.target.deckId!,
            ranked: false
        })

        const newRoomState = await createGameState({
            roomId: room.id,
            ranked: false
        })

        if (!newRoomState) return

        Battle_Brawlers_Game_State.push(newRoomState)

        intervalIds.push({
            roomId: newRoomState.roomId,
            finishing: false,
            players: newRoomState.players.map(p => ({
                userId: p.userId,
                timeoutId: null,
                deadlineAt: null,
            }))
        })

        // Accusé de défi accepté : sans lui, la carte du challenger reste
        // indéfiniment sur « en attente de réponse ».
        const acceptPayload: chalengeAcceptRedirectProps = {
            chalengerId: challenge.chalenger.userId,
            userId: challenge.target.userId,
        }
        io.to(chalengerSocket).emit('chalenge-accept-redirect', acceptPayload)
        io.to(targetSocket).emit('chalenge-accept-redirect', acceptPayload)

        io.to(chalengerSocket).emit('match-found', newRoomState.roomId)
        io.to(targetSocket).emit('match-found', newRoomState.roomId)

        const p1rooms = GetUsersRooms(challenge.chalenger.userId)
        const p2rooms = GetUsersRooms(challenge.target.userId)

        io.to(chalengerSocket).emit('get-rooms-user-id', p1rooms)
        io.to(targetSocket).emit('get-rooms-user-id', p2rooms)

        const roomState = Battle_Brawlers_Game_State[Battle_Brawlers_Game_State.indexOf(newRoomState)]

        syncClocks({ io: io, roomState: roomState })
    })
}

export const CancelChalengeSocket = (io: Server, socket: Socket) => {

    socket.on('cancel-chalenge', ({ targetId, userId }: CancelChalengeSocketPropsType) => {

        if (!assertActor(socket, userId, 'cancel-chalenge')) return

        const challenge = ChallengeService.cancel({
            chalengerId: userId,
            targetId
        })

        if (!challenge) return

        const targetSocket = socketOf(targetId)
        if (!targetSocket) return

        io.to(targetSocket).emit('chalenge-canceled', userId)
    })
}

export const RejectChalengeSocket = (io: Server, socket: Socket) => {

    socket.on('chalenge-rejected', ({ chalengerId, userId }: RejectChalengeSocketPropsType) => {

        if (!assertActor(socket, userId, 'chalenge-rejected')) return

        const challenge = ChallengeService.reject({
            chalengerId,
            targetId: userId
        })

        if (!challenge) return

        const chalengerSocket = socketOf(chalengerId)
        if (!chalengerSocket) return

        io.to(chalengerSocket).emit('chalenge-rejected', userId)
    })
}
