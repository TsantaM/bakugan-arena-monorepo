import type { useAbilityCardProps } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { useAbilityCardServer } from "../functions/use-abiliy-card";
import { clearAnimationsInRoom } from "./clear-animations-socket";

export const socketUseAbilityCard = (io: Server, socket: Socket) => {
    socket.on('use-ability-card', ({ roomId, abilityId, slot, userId, bakuganKey }: useAbilityCardProps) => {
        clearAnimationsInRoom(roomId)
        const data = {
            roomId: roomId,
            abilityId: abilityId,
            slot: slot,
            userId: userId,
            bakuganKey: bakuganKey
        }

        useAbilityCardServer({ abilityId: abilityId, bakuganKey: bakuganKey, roomId: roomId, slot: slot, userId: userId, io: io })
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }

    })
}