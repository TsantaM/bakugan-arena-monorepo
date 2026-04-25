import { SetBakuganAndAddRenfortAnimationDirective } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { bakuganOnSlot } from "../../type/room-types.js"
import { TigrerraHaos } from "../bakugans/tigrerra.js"

export const SabreDeLaMort: exclusiveAbilitiesType = {
    key: 'sabre-de-la-mort',
    name: 'Cut in Saber',
    description: `Adds Tigrerra into a battle`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: true,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            const deck = roomState?.decksState.find((d) => d.userId === userId)?.bakugans

            if (user && deck && slotOfGate) {
                const tigrerra = deck.find((b) => b?.bakuganData.key === 'tigrerra-haos' && !b.bakuganData.elimined && !b.bakuganData.onDomain)
                const ability = tigrerra?.excluAbilitiesState.find((a) => a.key === 'sabre-de-la-mort')
                if (tigrerra && ability) {
                    const lastId = slotOfGate.bakugans.length > 0 ? slotOfGate.bakugans[slotOfGate.bakugans.length - 1].id : 0
                    const newId = lastId + 1

                    const usersBakugan: bakuganOnSlot = {
                        slot_id: slot,
                        id: newId,
                        key: tigrerra.bakuganData.key,
                        userId: userId,
                        powerLevel: tigrerra.bakuganData.powerLevel,
                        currentPower: tigrerra.bakuganData.powerLevel,
                        attribut: tigrerra.bakuganData.attribut,
                        image: tigrerra.bakuganData.image,
                        abilityBlock: false,
                        assist: false,
                        statut: {
                            notRetreat: false,
                            poisoned: false,
                            trapped: false,
                            protectedAgainstGate: false,
                            protectedAgainstAbility: false,
                            protected: false
                        },
                        family: tigrerra.bakuganData.family
                    }

                    slotOfGate.bakugans.push(usersBakugan)
                    tigrerra.bakuganData.onDomain = true
                    ability.used = true

                    SetBakuganAndAddRenfortAnimationDirective({
                        animations: roomState.animations,
                        bakugan: usersBakugan,
                        slot: structuredClone(slotOfGate),
                        turn: roomState.turnState.turnCount

                    })
                }
            }
        }
        return null
    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const { battleInProcess, paused } = roomState.battleState

        if (!battleInProcess) return false
        if (battleInProcess && paused) return false

        const userDeck = roomState.decksState.find((deck) => deck.userId === userId)
        if (!userDeck) return false

        const tigrerra = userDeck.bakugans.find((bakugan) => bakugan?.bakuganData !== undefined && bakugan.bakuganData.key === TigrerraHaos.key)

        if (!tigrerra) return false
        if (tigrerra.bakuganData.elimined) return false
        if (tigrerra.bakuganData.onDomain) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        const { battleInProcess, paused, slot } = roomState.battleState

        if (!battleInProcess) return false
        if (battleInProcess && paused) return false

        if (bakugan.slot_id !== slot) return false

        return true
    },
}