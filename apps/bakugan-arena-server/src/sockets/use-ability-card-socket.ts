import type { useAbilityCardProps } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { useAbilityCardServer } from "../functions/use-abiliy-card";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { CheckTurnPermissions } from "../functions/ckeck-turn-permissions";
import { grantActionIncrement } from "../functions/start-player-timer";
import { logPermissionDenied, logSocketEvent } from "../functions/log-socket-event";

export const socketUseAbilityCard = (io: Server, socket: Socket) => {
    socket.on('use-ability-card', ({ roomId, abilityId, slot, userId, bakuganKey }: useAbilityCardProps) => {
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return
        if (state.status.finished === true) return

        const checker = CheckTurnPermissions({
            roomState: state,
            userId: userId,
            response: {
                type: "USE_ABILITY_CARD",
                abilityId: abilityId,
                bakuganKey: bakuganKey,
                slot: slot
            }
        })

        if (!checker) {
            logPermissionDenied(state, "use-ability-card", userId)
            return
        }

        clearAnimationsInRoom(roomId)

        logSocketEvent(state, {
            handler: "use-ability-card",
            userId,
            input: { roomId, abilityId, slot, bakuganKey },
            message: "Utilisation d'une carte ability",
        })

        grantActionIncrement({ roomState: state, userId, io })
        useAbilityCardServer({ abilityId: abilityId, bakuganKey: bakuganKey, roomId: roomId, slot: slot, userId: userId, io: io })

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }

    })
}