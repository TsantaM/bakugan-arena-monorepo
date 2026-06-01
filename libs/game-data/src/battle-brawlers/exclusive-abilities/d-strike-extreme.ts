import { PowerChange } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const DStrikeExtreme: exclusiveAbilitiesType = {
    key: 'd-strike-extreme',
    name: 'D Strike Extreme',
    description: `A Fusion Ability that adds an additional +200 Gs if D Strike Attack is activated.`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    fusionWith: "d-strike-attack",
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {

            const activateAbilities = slotOfGate.activateAbilities
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {

                const ability = activateAbilities.find((a) => a.key === 'd-strike-attack' && a.bakuganKey === user.key && a.userId === user.userId && !a.canceled)

                if (!ability) return null

                PowerChange({
                    bakugan: user,
                    G: 200,
                    malus: false,
                    roomState: roomState
                })

                if (ability.fusion) {
                    ability.fusion.push(DStrikeExtreme.key)
                } else {
                    ability.fusion = [DStrikeExtreme.key]
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
            const abilityToCancel = slotOfGate.activateAbilities.find((a) => a.key === DStrikeExtreme.key)
            if (user && abilityToCancel) {
                PowerChange({
                    bakugan: user,
                    G: 200,
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

        const ability = activateAbilities.find((a) => a.key === 'd-strike-attack' && a.bakuganKey === bakugan.key && a.userId === bakugan.userId && !a.canceled)

        if (!ability) {
            return false
        }

        return true
    },
}