import { AbilityCardFailed, dragBakuganToUserSlot } from "../../function/index.js"
import { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { bakuganToMoveType2 as bakuganToMoveType } from "../../type/type-index.js"

export const ForceDattraction: exclusiveAbilitiesType = {
    key: `force-d'attraction`,
    name: `Attractor`,
    maxInDeck: 2,
    description: `Attract one Bakugan from another Gate Card to user's Gate Card`,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ card: ForceDattraction.name })

        if (!roomState) return animation

        if (ForceDattraction.activationConditions) {
            const checker = ForceDattraction.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        if (!roomState) return animation

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat().filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected)
        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: "Attractor : Select a Bakugan to drag",
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        dragBakuganToUserSlot({ resolution: resolution, roomState: roomState })
    },
    activationConditions: ({ roomState, userId }) => {
        if (!roomState) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().length
        if (bakugans < 2) return false
        return true
    },
    canUse({ bakugan, roomState }) {

        if (!roomState) return false
        const bakugansOnOtherSlots = roomState.protalSlots.filter((slot) => slot.id !== bakugan.slot_id).map((slot) => slot.bakugans).flat().filter((b) => !b.statut.trapped && !b.statut.protected && !b.statut.protectedAgainstAbility).length
        if (bakugansOnOtherSlots < 1) return false

        return true
    }
}