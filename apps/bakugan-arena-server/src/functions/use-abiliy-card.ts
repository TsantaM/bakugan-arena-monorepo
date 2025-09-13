import { AbilityCardsList, ExclusiveAbilitiesList, slots_id } from "@bakugan-arena/game-data";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";

export const useAbilityCardServer = ({ roomId, abilityId, slot, userId, bakuganKey }: { roomId: string, abilityId: string, slot: slots_id, userId: string, bakuganKey: string }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
    const abilities = [...AbilityCardsList, ...ExclusiveAbilitiesList]
    const abilityToUse = abilities.find((a) => a.key === abilityId)

    if (roomData && abilityToUse) {
        abilityToUse.onActivate({ roomState: roomData, roomId: roomId, bakuganKey: bakuganKey, slot: slot, userId: userId })

        const abilityCardUsed = roomData.decksState.find((d) => d.userId === userId)?.abilities.find((a) => a.key === abilityId && a.used === false)
        const exclusiveCardUsed = roomData.decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey && b.excluAbilitiesState.find((e) => e.key === abilityId && e.used === false))?.excluAbilitiesState

        if(abilityCardUsed) {
            abilityCardUsed.used = true
        }

        if(exclusiveCardUsed) {
            exclusiveCardUsed[0].used = true
        }
    }
}