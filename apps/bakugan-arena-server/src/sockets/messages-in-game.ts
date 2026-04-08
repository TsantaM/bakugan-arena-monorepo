import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { Message, SendMessageInGameType } from "@bakugan-arena/game-data/dist";
import { db } from "../lib/db";
import { eq } from "drizzle-orm";

export function SendMessageInGame(io: Server, socket: Socket) {
    socket.on('send-message-in-game', async ({ roomId, text, userId }: SendMessageInGameType) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        if(!roomData) return
        // Get User name
        const getUsername = await db.query.user.findFirst({
            where: (u) => eq(u.id, userId),
            columns: {
                displayUsername: true
            }
        })

        const username = getUsername?.displayUsername

        // const username = roomData.players.find((p) => p.userId === userId)?.username
        if (!username) return

        const message: Message = {
            text: text,
            turn: roomData.turnState.turnCount,
            description: false,
            userName: username
        }

        roomData.messages.push(message)

        roomData.connectedsUsers.forEach((user) => {
            io.to(user.nextjsSocket).emit('new-message-in-game', message)
        })

    })
}