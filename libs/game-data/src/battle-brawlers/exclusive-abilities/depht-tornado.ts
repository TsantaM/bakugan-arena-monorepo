import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js";
import { exclusiveAbilitiesType } from "../../type/type-index.js";
import { JuggernoidAquos } from "../bakugans/juggernoid.js";

export const DepthTornado: exclusiveAbilitiesType = {
    key: 'depth-tornado',
    name: 'Depth Tornado',
    description: `Adds 100 Gs to Juggernoid`,
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })
            }
        }

        return null

    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilityToCancel = slotOfGate.activateAbilities.find((a) => a.key === DepthTornado.key)
            if (user && abilityToCancel) {
                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: true,
                    roomState: roomState
                })
            }
        }
    },
    activationConditions({ roomState }) {

        const { battleInProcess, paused } = roomState.battleState

        if (battleInProcess || (battleInProcess && !paused)) return false

        return true

    },
    canUse({ bakugan }) {

        if(bakugan.key !== JuggernoidAquos.key) return false

        return true
        
    },
}