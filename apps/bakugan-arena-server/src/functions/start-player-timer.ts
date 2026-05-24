import { Message, stateType } from "@bakugan-arena/game-data";
import { Server } from "socket.io/dist";
import { db } from "../lib/db"
import { eq } from "drizzle-orm"
import { schema } from "@bakugan-arena/drizzle-orm"
import { intervalIds } from "../game-state/battle-brawlers-game-state";
import { CalculateAndUpdateElo } from "./ladder-functions/calculate-elo";
import { SendUserRooms } from "./send-user-rooms";

const rooms = schema.rooms

export function StopPlayerTimer({
    roomState,
    userId
}: {
    roomState: stateType,
    userId: string
}) {
    const intervals = intervalIds.find(i => i.roomId === roomState.roomId)
    if (!intervals) return

    const playerInterval = intervals.players.find(p => p.userId === userId)
    if (!playerInterval) return

    if (playerInterval.intervalId !== null) {
        clearInterval(playerInterval.intervalId)
        playerInterval.intervalId = null
    }
}

export function StartPlayerTime({ roomState, userId, io }: { roomState: stateType, userId: string, io?: Server }) {
    const intervals = intervalIds.find(i => i.roomId === roomState.roomId)

    const player = roomState.players.find((player) => player.userId === userId)
    if (!player) return
    if (!intervals) return

    const playerInterval = intervals.players.find(p => p.userId === userId)
    if (!playerInterval) return

    if (playerInterval.intervalId !== null) return

    playerInterval.intervalId = setInterval(async () => {
        player.timer -= 1

        if (io) {
            io.to(roomState.roomId).emit("player-timer", {
                userId: player.userId,
                remaining: player.timer,
            })
        }

        if (player.timer === 0) {
            if (playerInterval.intervalId !== null) {
                clearInterval(playerInterval.intervalId)
                playerInterval.intervalId = null
            }

            const looser = player.userId
            const winner = roomState.players.find((player) => player.userId !== looser)?.userId
            if (!winner) return

            await db
                .update(rooms)
                .set({
                    winner: winner,
                    looser: looser,
                    finished: true,
                })
                .where(eq(rooms.id, roomState.roomId))

            roomState.status.finished = true
            roomState.status.winner = winner

            if (io) {
                await CalculateAndUpdateElo({
                    loser: looser,
                    winner: winner,
                    roomData: roomState,
                    io,
                    roomId: roomState.roomId,
                })

                roomState.players.forEach((user) => {
                    SendUserRooms({ userId: user.userId, io })
                })
            }
        }
    }, 1000)
}


export function UpdatePlayerTimer({ roomState, io }: { roomState: stateType, io: Server }) {

    const rooms = schema.rooms

    if (!roomState) return

    const intervals = intervalIds.find((interval) => interval.roomId === roomState?.roomId)
    // console.log(intervals)

    if (!intervals) return

    if (roomState.status.finished) {
        for (const playerInterval of intervals.players) {
            const id = playerInterval.intervalId;
            if (id != null) {
                clearInterval(id);
                playerInterval.intervalId = null;
            }
        }
    } else {
        const activeDeck = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
        const activePlayer = intervals.players.find((player) => player.userId === roomState.turnState.turn)
        const inactiveDeck = roomState.decksState.find((deck) => deck.userId !== roomState.turnState.turn)
        const inactivePlayer = intervals.players.find((player => player.userId !== roomState.turnState.turn))
        const active = roomState.ActivePlayerActionRequest
        const inactive = roomState.InactivePlayerActionRequest

        const roomId = roomState.roomId
        const activeMerged = [...active.actions.mustDo, ...active.actions.mustDoOne, ...active.actions.optional].length
        // console.log("active", activeMerged)

        if (activePlayer && activeDeck && activeMerged > 0) {

            if (activePlayer.intervalId !== null) return

            activePlayer.intervalId = setInterval(async () => {
                const player = roomState.players.find((player) => player.userId === activePlayer.userId)
                if (!player) return
                const userId = player.userId
                player.timer -= 1

                const timer: { userId: string, remaining: number } = {
                    userId,
                    remaining: player.timer
                }

                io.to(roomId).emit("player-timer", timer);

                if (player.timer === 0) {
                    if (activePlayer && activePlayer.intervalId !== null) {
                        clearInterval(activePlayer.intervalId)
                        activePlayer.intervalId = null
                    }
                    const looser = player.userId
                    const winner = roomState.players.find((player) =>
                        player.userId !== userId
                    )?.userId
                    if (!winner) return

                    await db
                        .update(rooms)
                        .set({
                            winner: winner,
                            looser: looser,
                            finished: true,
                        })
                        .where(eq(rooms.id, roomId))

                    roomState.status.finished = true
                    roomState.status.winner = winner

                    await CalculateAndUpdateElo({
                        loser: looser,
                        winner: winner,
                        roomData: roomState,
                        io,
                        roomId,
                    })

                    roomState.players.forEach((user) => {
                        SendUserRooms({ userId: user.userId, io })
                    })

                    return

                }

            }, 1000)

        } else {
            if (activePlayer && activePlayer.intervalId !== null) {
                clearInterval(activePlayer.intervalId)
                activePlayer.intervalId = null
            }
        }

        const inactiveMerged = [...inactive.actions.mustDo, ...inactive.actions.mustDoOne, ...inactive.actions.optional].length
        // console.log("inactive", inactiveMerged)

        if (inactivePlayer && inactiveDeck && inactiveMerged > 0) {

            if (inactivePlayer.intervalId !== null) return

            inactivePlayer.intervalId = setInterval(async () => {

                const player = roomState.players.find((player) => player.userId === inactivePlayer.userId)
                if (!player) return
                const userId = player.userId
                player.timer -= 1

                const timer: { userId: string, remaining: number } = {
                    userId,
                    remaining: player.timer
                }

                io.to(roomId).emit("player-timer", timer);

                if (player.timer === 0) {
                    if (inactivePlayer && inactivePlayer.intervalId !== null) {
                        clearInterval(inactivePlayer.intervalId)
                        inactivePlayer.intervalId = null
                    }
                    const looser = player.userId
                    const winner = roomState.players.find((player) => player.userId !== userId)?.userId
                    if (!winner) return

                    await db
                        .update(rooms)
                        .set({
                            winner: winner,
                            looser: looser,
                            finished: true,
                        })
                        .where(eq(rooms.id, roomId))

                    roomState.status.finished = true
                    roomState.status.winner = winner

                    await CalculateAndUpdateElo({
                        loser: looser,
                        winner: winner,
                        roomData: roomState,
                        io,
                        roomId,
                    })

                    roomState.players.forEach((user) => {
                        SendUserRooms({ userId: user.userId, io })
                    })

                    return

                }

            }, 1000)
        } else {
            if (inactivePlayer && inactivePlayer.intervalId !== null) {
                clearInterval(inactivePlayer.intervalId)
                inactivePlayer.intervalId = null
            }
        }
    }

}

export function StartTwoTimers({ roomState, io, roomId }: { roomState: stateType, io: Server, roomId: string }) {

    const turnCount = roomState.turnState.turnCount
    const players = roomState.players

    if (turnCount > 0) return
    const intervals = intervalIds.find((interval) => interval.roomId === roomState?.roomId)
    // console.log(intervals)

    if (!intervals) return


    players.forEach((player) => {

        const interval = intervals.players.find((p) => p.userId === player.userId)
        if (!interval) return
        if (interval.intervalId !== null) return

        interval.intervalId = setInterval(async () => {

            const player = roomState.players.find((player) => player.userId === interval.userId)
            if (!player) return
            const userId = player.userId
            player.timer -= 1

            const timer: { userId: string, remaining: number } = {
                userId,
                remaining: player.timer
            }

            io.to(roomId).emit("player-timer", timer);

            if (players.some((pl) => pl.timer === 0)) {
                roomState.status.finished = true
                roomState.status.winner = null

                roomState.players.forEach((user) => {
                    StopPlayerTimer({ roomState: roomState, userId: user.userId })
                })

                await db
                    .update(rooms)
                    .set({
                        finished: true,
                    })
                    .where(eq(rooms.id, roomId))

                const message: Message = {
                    text: 'Game is over ! Equality !',
                    turn: roomState.turnState.turnCount
                }

                io.to(roomId).emit('game-finished', message)

                roomState.players.forEach((user) => {
                    SendUserRooms({ userId: user.userId, io })
                })
            }

        }, 1000)

    })

}