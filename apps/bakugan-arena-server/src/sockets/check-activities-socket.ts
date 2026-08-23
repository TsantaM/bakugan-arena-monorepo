import { Server, Socket } from "socket.io";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { resumeRoomFlowWithAutoSkip } from "../functions/resume-room-flow-defaults";

export function CheckActivitiesSocket(io: Server, socket: Socket) {
    socket.on('check-activities', ({ userId, roomId }: { userId: string, roomId: string }) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

        if (!roomData || roomData.status.finished) return

        // Ne pas renvoyer les turn-actions à l'adversaire : le bot poll souvent
        // via check-activities et chaque re-emit resettait l'UI du joueur humain.
        resumeRoomFlowWithAutoSkip({
            roomState: roomData,
            io,
            userId,
            source: "check-activities",
            onlyUserId: userId,
        })
    })
}
