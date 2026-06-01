import { PowerChange } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const MeltFlare: exclusiveAbilitiesType = {
    key: 'melt-flare',
    name: 'Melt Flare',
    description: `A Fusion Ability that adds an additional +150 Gs if Boosted Dragon is activated.`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    fusionWith: "dragonoid-plus",
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {

            const activateAbilities = slotOfGate.activateAbilities
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {

                const ability = activateAbilities.find((a) => a.key === 'dragonoid-plus' && a.bakuganKey === user.key && a.userId === user.userId && !a.canceled)

                if (!ability) return null

                PowerChange({
                    bakugan: user,
                    G: 150,
                    malus: false,
                    roomState: roomState
                })

                if (ability.fusion) {
                    ability.fusion.push(MeltFlare.key)
                } else {
                    ability.fusion = [MeltFlare.key]
                }

            }

        }

        return null

    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilityToCancel = slotOfGate.activateAbilities.find((a) => a.key === MeltFlare.key)
            if (user && abilityToCancel) {
                PowerChange({
                    bakugan: user,
                    G: 150,
                    malus: true,
                    roomState: roomState
                })
            }
        }
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        const slot = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        const activateAbilities = slot.activateAbilities

        const ability = activateAbilities.find((a) => a.key === 'dragonoid-plus' && a.bakuganKey === bakugan.key && a.userId === bakugan.userId && !a.canceled)

        if (!ability) {
            return false
        }

        return true
    },
}