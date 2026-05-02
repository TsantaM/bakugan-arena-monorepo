import { AbilityCardFailed, moveSelectedBakugan } from "../../function/index.js"
import type { AbilityCardsActions, bakuganToMoveType2 as bakuganToMoveType, exclusiveAbilitiesType } from "../../type/type-index.js"

export const LanceEclair: exclusiveAbilitiesType = {
    key: 'lance-eclair',
    name: 'Sling Blazer',
    description: `Enable Mantris to move any bakugan to any adjacent Gate Card that its owner chooses`,
    maxInDeck: 1,
    extraInputs: ["move-opponent"],
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        const animation = AbilityCardFailed({ card: LanceEclair.name })

        if (!roomState) return animation

        if (LanceEclair.activationConditions) {
            const checker = LanceEclair.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation
        if (!slotOfGate) return animation
        if (slotOfGate.bakugans.length < 2) return animation

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)

        const bakugans: bakuganToMoveType[] = slotOfGate.bakugans.filter((b) => b.userId !== userId).filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected).map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: slotOfGate.id
        }))

        if (slots.length <= 0) return animation

        const request: AbilityCardsActions = {
            type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
            message: 'Sling Blazer : Select a Bakugan to move and his destination',
            bakugans: bakugans,
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        moveSelectedBakugan({ resolution: resolution, roomState: roomState, requireUserOnSlot: true })
    },
    activationConditions: ({ roomState, userId }) => {
        if (!roomState) return false

        const { battleInProcess, paused } = roomState.battleState

        if (!battleInProcess || (battleInProcess && paused)) return false

        return true
    },
    canUse({ bakugan, roomState }) {
        if (!roomState) return false
        const slotOfBakugan = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
        if (!slotOfBakugan) return false
        if (slotOfBakugan.id !== roomState.battleState.slot) return false
        if (slotOfBakugan.bakugans.length < 2) return false
        const otherBakugans = slotOfBakugan.bakugans.filter((b) => b.key !== bakugan.key && b.userId !== bakugan.userId).filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected)
        if (otherBakugans.length < 1) return false
        return true
    }
}