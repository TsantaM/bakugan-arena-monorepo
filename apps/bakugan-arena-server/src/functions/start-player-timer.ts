import { Message, stateType } from "@bakugan-arena/game-data";
import { Server } from "socket.io/dist";
import { db } from "../lib/db"
import { eq } from "drizzle-orm"
import { schema } from "@bakugan-arena/drizzle-orm"
import { intervalIds } from "../game-state/battle-brawlers-game-state";


export function UpdatePlayerTimer({ roomState, io }: { roomState: stateType, io: Server }) {

    const rooms = schema.rooms

    if (!roomState) return

    const intervals = intervalIds.find((interval) => interval.roomId === roomState?.roomId)
    console.log(intervals)

    if (!intervals) return

    const activeDeck = roomState.decksState.find((deck) => deck.userId === roomState.turnState.turn)
    const activePlayer = intervals.players.find((player) => player.userId === roomState.turnState.turn)
    const inactiveDeck = roomState.decksState.find((deck) => deck.userId !== roomState.turnState.turn)
    const inactivePlayer = intervals.players.find((player => player.userId !== roomState.turnState.turn))
    const active = roomState.ActivePlayerActionRequest
    const inactive = roomState.InactivePlayerActionRequest

    const roomId = roomState.roomId
    const activeMerged = [...active.actions.mustDo, ...active.actions.mustDoOne, ...active.actions.optional].length
    console.log("active", activeMerged)

    if (activePlayer && activeDeck && activeMerged > 0) {

        if(activePlayer.intervalId !== null) return

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

                const winnerName = roomState.players.find((player) =>
                    player.userId !== userId
                )?.username || ''

                const message: Message = {
                    text: `Game is over ! The winner is ${winnerName}`
                }
                io.to(roomId).emit('game-finished', message)


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
    console.log("inactive", inactiveMerged)

    if (inactivePlayer && inactiveDeck && inactiveMerged > 0) {

        if(inactivePlayer.intervalId !== null) return

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
                const winner = roomState.players.find((player) => {
                    player.userId !== userId
                })?.userId
                if (!winner) return

                await db
                    .update(rooms)
                    .set({
                        winner: winner,
                        looser: looser,
                        finished: true,
                    })
                    .where(eq(rooms.id, roomId))

                const winnerName = roomState.players.find((player) =>
                    player.userId !== userId
                )?.username || ''

                const message: Message = {
                    text: `Game is over ! The winner is ${winnerName}`
                }
                io.to(roomId).emit('game-finished', message)

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