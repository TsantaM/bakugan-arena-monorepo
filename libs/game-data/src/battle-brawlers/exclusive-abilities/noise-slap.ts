import { AbilityCardFailed, PowerChange } from "../../function/index.js";
import { Slots } from "../../store/slots.js";
import { AbilityCardsActions, bakuganToMoveType2 as bakuganToMoveType } from "../../type/actions-serveur-requests.js";
import { exclusiveAbilitiesType } from "../../type/game-data-types.js";

export const NoiseSlap: exclusiveAbilitiesType = {
    key: 'noise-slap',
    name: 'Noise Slap',
    description: `Decrease the selected bakugan's power by 100 Gs.`,
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: true,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ card: NoiseSlap.name })

        if (!roomState) return animation

        if (NoiseSlap.activationConditions) {
            const checker = NoiseSlap.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !userData) return animation

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat().filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected)

        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        if(bakugans.length === 0) {
            return animation
        }

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: 'Noise Slap : Select a Bakugan to target',
            bakugans: bakugans
        }

        return request

    },
    onAdditionalEffect({ resolution, roomData }) {
        if(resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return
        const {bakugan, slot, userId} = resolution.data

        const slotTarget = roomData.protalSlots[Slots.indexOf(slot)]
        const target = slotTarget.bakugans.find((b) => b.key === bakugan && b.userId === userId)
        if(!target) return

        PowerChange({
            bakugan: target,
            G: 100,
            malus: true,
            roomState: roomData
        })

    },
    activationConditions: ({ roomState, userId }) => {
        if (!roomState) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().length
        const slotWithCard = roomState.protalSlots.filter((slot) => slot.portalCard !== null).length
        if (slotWithCard < 2) return false
        if (bakugans < 2) return false
        return true
    },
    // canUse({ roomState, bakugan }) {
    //     return true
    // },
}