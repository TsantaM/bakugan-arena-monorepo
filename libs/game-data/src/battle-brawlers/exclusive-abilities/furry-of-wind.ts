import { CheckBattleStillInProcess, ComeBackBakuganEffect, ElimineBakuganEffect, ResetSlot } from "../../function/index.js"
import { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { SkyressVentus } from "../bakugans/skyress.js"

export const FurryOfWind: exclusiveAbilitiesType = {
    key: "furry-of-wind",
    description: "When three allied Ventus Bakugan, including Ventus Skyress, are present on the field, this card eliminates all opposing Bakugan on the battlefield. Additionally, it allows the user to return their own Bakugan to their hand. If this card is activated during a battle, the current Gate Card is removed from play.",
    maxInDeck: 1,
    name: "Furry of Wind",
    image: "furry-of-wind.jpg",
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, slot }) {

        if (!roomState) return null
        if (!FurryOfWind.activationConditions) return null
        if (!FurryOfWind.canUse) return null

        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat()
        const opponentBakugans = bakugans.filter((bakugan) => bakugan.userId !== userId)
        const userBakugans = bakugans.filter((bakugan) => bakugan.userId === userId)

        opponentBakugans.forEach((bakugan) => {
            ElimineBakuganEffect({
                bakugan: bakugan,
                roomState: roomState,
            })
        })

        userBakugans.forEach((bakugan) => {
            ComeBackBakuganEffect({
                bakugan: bakugan,
                roomState: roomState
            })
        })

        const battleState = roomState.battleState
        if (battleState.battleInProcess && battleState.slot === slot) {
            const slotOfGate = roomState.protalSlots.find((slot) => slot.id === battleState.slot)
            if (!slotOfGate) return null

            const removeGateCard: AnimationDirectivesTypes = {
                type: 'REMOVE_GATE_CARD',
                data: {
                    slot: slotOfGate
                },
                resolved: false,
            }

            roomState.animations.push(removeGateCard)

            ResetSlot(slotOfGate)

        }

        CheckBattleStillInProcess(roomState)

        return null

    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false

        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat()
        const ventusBakugans = bakugans.filter((bakugan) => bakugan.attribut === "Ventus" && bakugan.userId === userId)
        const skyress = ventusBakugans.find((bakugan) => bakugan.key === SkyressVentus.key)

        if (ventusBakugans.length < 3) return false
        if (!skyress) return false

        return true

    },
    canUse({ bakugan }) {
        if (bakugan.key !== SkyressVentus.key) return false
        return true
    },
}