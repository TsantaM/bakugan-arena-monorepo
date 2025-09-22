import { bakuganToMoveType, slots_id } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { useAbilityCardServer } from "../functions/use-abiliy-card";

export const socketUseAbilityCard = (io: Server, socket: Socket) => {
    socket.on('use-ability-card', ({ roomId, abilityId, slot, userId, bakuganKey, target_slot, slot_to_move, target, slotToDrag, bakuganToAdd, bakuganToMove, destination }: { roomId: string, abilityId: string, slot: slots_id, userId: string, bakuganKey: string, target_slot: slots_id | '', slot_to_move: slots_id | '', target: string | '', slotToDrag: slots_id | '', bakuganToAdd: string, bakuganToMove: bakuganToMoveType | undefined, destination: slots_id | '' }) => {
        console.log(roomId, abilityId, slot, userId, bakuganKey, target_slot, slot_to_move, target, slotToDrag, bakuganToAdd, bakuganToMove, destination)
        useAbilityCardServer({ abilityId: abilityId, bakuganKey: bakuganKey, roomId: roomId, slot: slot, userId: userId, target_slot, slot_to_move, target, slotToDrag: slotToDrag, bakuganToAdd: bakuganToAdd, bakuganToMove: bakuganToMove, destination: destination})
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }

    })
} 