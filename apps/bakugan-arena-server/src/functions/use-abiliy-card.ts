import { AbilityCardsList, bakuganToMoveType, ExclusiveAbilitiesList, slots_id } from "@bakugan-arena/game-data";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { activateAbilities } from "@bakugan-arena/game-data/src/type/room-types";

export const useAbilityCardServer = ({ roomId, abilityId, slot, userId, bakuganKey, target_slot, slot_to_move, target, slotToDrag, bakuganToAdd, bakuganToMove, destination }: { roomId: string, abilityId: string, slot: slots_id, userId: string, bakuganKey: string, target_slot: slots_id | '', slot_to_move: slots_id | '', target: string | '', slotToDrag: slots_id | '', bakuganToAdd: string, bakuganToMove: bakuganToMoveType | undefined, destination: slots_id | '' }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
    const abilities = [...AbilityCardsList, ...ExclusiveAbilitiesList]
    const abilityToUse = abilities.find((a) => a.key === abilityId)
    const playerAbilities = roomData?.players.find((p) => p.userId === userId)?.usable_abilitys
    const slotObj = Battle_Brawlers_Game_State[roomIndex]?.protalSlots.find((s) => s.id === slot)
    const abilityUser = slotObj?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

    console.log(target, slotToDrag)

    if (roomData && abilityToUse && playerAbilities && playerAbilities > 0 && abilityUser && !abilityUser.abilityBlock) {
        abilityToUse.onActivate({ roomState: roomData, roomId: roomId, bakuganKey: bakuganKey, slot: slot, userId: userId, target_slot: target_slot, slot_to_move: slot_to_move, target: target, slotToDrag: slotToDrag, bakuganToAdd: bakuganToAdd, bakuganToMove: bakuganToMove, destination: destination })


        if (slotObj) {

            const abilities = slotObj.activateAbilities
            const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0
            const newId = lastId + 1
            const newAbilityToPush: activateAbilities = {
                id: newId, // supérieur au précédent
                bakuganKey: bakuganKey,
                canceled: false,
                key: abilityId,
                userId: userId
            }

            Battle_Brawlers_Game_State[roomIndex]?.protalSlots.find((s) => s.id === slot)?.activateAbilities.push(newAbilityToPush)
        }

        const abilityCardUsed = roomData.decksState.find((d) => d.userId === userId)?.abilities.find((a) => a.key === abilityId && a.used === false)
        const exclusiveCardUsed = roomData.decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey && b.excluAbilitiesState.find((e) => e.key === abilityId && e.used === false))?.excluAbilitiesState

        if (abilityCardUsed) {
            abilityCardUsed.used = true
        }

        if (exclusiveCardUsed) {
            exclusiveCardUsed[0].used = true
        }

        const state: typeof roomData = {
            ...roomData,
            players: roomData.players.map((p) => p.userId === userId ? {
                ...p,
                usable_abilitys: p.usable_abilitys - 1
            } : p),
        }

        Battle_Brawlers_Game_State[roomIndex] = state
    }
}