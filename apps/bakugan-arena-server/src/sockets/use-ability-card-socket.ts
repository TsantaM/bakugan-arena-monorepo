import type { useAbilityCardProps } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io";
import { useAbilityCardServer } from "../functions/use-abiliy-card";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { CheckTurnPermissions } from "../functions/ckeck-turn-permissions";
import {
    emitRoomStateUpdate,
    runRoomSocketAction,
} from "../functions/room-runtime";

export const socketUseAbilityCard = (io: Server, socket: Socket) => {
    socket.on('use-ability-card', (payload: useAbilityCardProps & { actionSeq?: number | string }) => {
        const { roomId, abilityId, slot, userId, bakuganKey, actionSeq } = payload

        runRoomSocketAction({
            socket,
            roomId,
            event: 'use-ability-card',
            actionSeq,
            userId,
            handler: (state) => {
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

                if (!checker) return

                clearAnimationsInRoom(roomId)

                useAbilityCardServer({
                    abilityId,
                    bakuganKey,
                    roomId,
                    slot,
                    userId,
                    io,
                })

                emitRoomStateUpdate(io, state, "update-room-state")
            },
        })
    })
}
