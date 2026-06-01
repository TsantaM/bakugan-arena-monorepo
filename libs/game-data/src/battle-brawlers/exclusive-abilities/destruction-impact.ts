import { CancelGateCardDirectiveAnimation, PowerChange } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { GateCardsList } from "../gate-gards.js"

export const DestructionImpact: exclusiveAbilitiesType = {
    key: 'destruction-impact',
    name: 'Destruction Impact',
    description: `A Fusion Ability that adds an additional +200 Gs and negate the gate card if Dual Gazer is activated.`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    fusionWith: "dual-gazer",
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {

            const activateAbilities = slotOfGate.activateAbilities
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {

                const ability = activateAbilities.find((a) => a.key === 'dual-gazer' && a.bakuganKey === user.key && a.userId === user.userId && !a.canceled)

                if (!ability) return null

                PowerChange({
                    bakugan: user,
                    G: 200,
                    malus: false,
                    roomState: roomState
                })

                if (slotOfGate.state.open && !slotOfGate.state.canceled && slotOfGate.portalCard) {
                    
                    const gate = slotOfGate.portalCard?.key
                    const gateToCancel = GateCardsList.find((g) => g.key === gate)
                    CancelGateCardDirectiveAnimation({
                        animations: roomState.animations,
                        slot: slotOfGate,
                        turn: roomState.turnState.turnCount
                    })
                    if (gateToCancel && gateToCancel.onCanceled) {
                        gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    }

                    slotOfGate.state.canceled = true

                }


                if (ability.fusion) {
                    ability.fusion.push(DestructionImpact.key)
                } else {
                    ability.fusion = [DestructionImpact.key]
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
            const abilityToCancel = slotOfGate.activateAbilities.find((a) => a.key === DestructionImpact.key)
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

        const ability = activateAbilities.find((a) => a.key === 'dual-gazer' && a.bakuganKey === bakugan.key && a.userId === bakugan.userId && !a.canceled)

        if (!ability) {
            return false
        }

        return true
    },
}