import { setGateCardProps } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export const UpdateGate = ({ roomId, gateId, slot, userId }: setGateCardProps) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    const usable_slot = roomData?.protalSlots.find((s) => s.id === slot)?.can_set
    const can_set_gate = roomData?.turnState.set_new_gate

    if (usable_slot && can_set_gate && roomData.turnState.previous_turn != userId) {
        const slotToUpdate = roomData.protalSlots.find((s) => s.id === slot)
        const deckToUpdate = roomData.decksState.find((s) => s.userId === userId)

        if (slotToUpdate && deckToUpdate) {
            const newSlotState: typeof slotToUpdate = {
                ...slotToUpdate,
                can_set: false,
                portalCard: {
                    key: gateId,
                    userId: userId
                }
            }

            const gateToUpdate = deckToUpdate.gates.find(
                (g) => g.key === gateId && g.usable === true && g.dead === false
            );

            let updated = false;

            const newDeckState = {
                ...deckToUpdate,
                gates: gateToUpdate
                    ? deckToUpdate.gates.map((g) => {
                        if (!updated && g.key === gateId && g.usable) {
                            updated = true; // on modifie seulement le premier trouvé
                            return { ...g, usable: false };
                        }
                        return g;
                    })
                    : deckToUpdate.gates,
            };

            console.log(newSlotState)

            const newPlayerState = roomData.players.find((p) => p.userId === userId)


            const state: typeof roomData = {
                ...roomData,
                players: roomData.players.map((p) => p.userId === newPlayerState?.userId ? {
                    ...p,
                    usable_gates: p.usable_gates - 1
                } : p),
                
                protalSlots: roomData.protalSlots.map((s) => s.id === slotToUpdate.id ? {
                    ...s,
                    bakugans: newSlotState.bakugans,
                    can_set: newSlotState.can_set,
                    portalCard: newSlotState.portalCard
                } : s),
                decksState: roomData.decksState.map((d) => d.userId === userId ? {
                    ...d,
                    gates: newDeckState.gates
                } : d)
            }

            console.log(state)

            if (roomIndex != -1) {
                Battle_Brawlers_Game_State[roomIndex] = state

            }
        }
    }

}

