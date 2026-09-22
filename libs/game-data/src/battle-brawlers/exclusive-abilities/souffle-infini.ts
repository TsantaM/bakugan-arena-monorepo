import {
    AbilityCardFailed,
    PowerChange,
    applyBakuganMove,
    canMoveBakugan,
} from "../../function/index.js"
import { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { bakuganToMoveType2 as bakuganToMoveType } from "../../type/type-index.js"

export const SouffleInfini: exclusiveAbilitiesType = {
    key: 'souffle-infini',
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ abilityKey: SouffleInfini.key })

        if (!roomState) return animation

        if (SouffleInfini.activationConditions) {
            const checker = SouffleInfini.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        const deck = roomState.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate || !deck || !userData) return animation

        const targets = roomState.protalSlots
            .filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0)
            .map((s) => s.bakugans)
            .flat()
            .filter((bakugan) => canMoveBakugan(bakugan, 'ABILITY'))

        const bakugans: bakuganToMoveType[] = targets.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_drag', params: { abilityKey: SouffleInfini.key } },
            bakugans: bakugans
        }

        return request
    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag = resolution.data.slot
        const target = resolution.data.bakugan
        const targetUserId = resolution.data.userId
        const slotTarget = roomState.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState.protalSlots.find((s) => s.id === resolution.slot)

        if (!slotOfGate || !slotTarget || !target) return

        const bakuganToDrag = slotTarget.bakugans.find(
            (b) => b.key === target && b.userId === targetUserId
        )
        const user = slotOfGate.bakugans.find(
            (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId
        )

        if (!user || !bakuganToDrag) return

        const outcome = applyBakuganMove({
            roomState,
            bakugan: bakuganToDrag,
            fromSlot: slotTarget,
            toSlot: slotOfGate,
            origin: 'ABILITY',
        })

        if (!outcome.moved) return

        // Le malus ne s'applique que si l'attraction a réellement eu lieu
        PowerChange({
            roomState,
            bakugan: outcome.bakugan,
            G: 50,
            malus: true,
            origin: 'ABILITY',
        })
    },
    activationConditions: ({ roomState }) => {
        if (!roomState) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().length
        if (bakugans < 2) return false
        return true
    },
    canUse({ bakugan, roomState }) {
        if (!roomState) return false
        const bakugansOnOtherSlots = roomState.protalSlots
            .filter((slot) => slot.id !== bakugan.slot_id)
            .map((slot) => slot.bakugans)
            .flat()
            .filter((b) => canMoveBakugan(b, 'ABILITY'))
            .length
        if (bakugansOnOtherSlots < 1) return false

        return true
    }
}
