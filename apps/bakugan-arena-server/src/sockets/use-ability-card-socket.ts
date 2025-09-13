import { slots_id } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { useAbilityCardServer } from "../functions/use-abiliy-card";

export const socketUseAbilityCard = (io: Server, socket: Socket) => {
    socket.on('use-ability-card', ({ roomId, abilityId, slot, userId, bakuganKey }: { roomId: string, abilityId: string, slot: slots_id, userId: string, bakuganKey: string }) => {


        useAbilityCardServer({ abilityId: abilityId, bakuganKey: bakuganKey, roomId: roomId, slot: slot, userId: userId })
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }

    })
} 