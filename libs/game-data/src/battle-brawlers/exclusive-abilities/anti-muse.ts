import { getAdjacentsSlots } from "../../function/index.js"
import { Slots } from "../../store/slots.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { SirenoidAquos } from "../bakugans/sirenoid.js"
import { DragAndElimineOnAdditional, DragAndElimineOnOpen } from "../../function/ability-cards-effects/drag-and-elimine-card-effect.js"

export const AntiMuse: exclusiveAbilitiesType = {
    key: 'anti-muse',
    name: 'Anthemusa',
    description: `Attracts all opposing Bakugans on the Gate Cards adjecent to the one where Sirenoid is located that have a lower power level, and eliminates immediately.`,
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    slotLimits: true,
    usable_if_user_not_on_domain: false,
    image: 'Anthemusa.png',
    onActivate: ({ roomState, userId, bakuganKey, slot, roomId }) => {
        return DragAndElimineOnOpen({ roomState, userId, bakuganKey, slot, card: AntiMuse, roomId })
    },
    onAdditionalEffect({ resolution, roomData }) {
        return  DragAndElimineOnAdditional({ resolution, roomData, cardData: AntiMuse })
    },
    activationConditions({ roomState }) {
        if (!roomState) return false
        if (roomState.battleState.battleInProcess) return false
        const bakugans = roomState.protalSlots.filter((slot) => slot.bakugans.length > 0).map((slot) => slot.bakugans).flat()
        if (bakugans.length < 2) return false
        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false

        if (bakugan.key !== SirenoidAquos.key) return false
        const slot = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        const adjacentSlots = getAdjacentsSlots({ slot: slot, roomState: roomState })
        const slotsWithOpponent = adjacentSlots.filter(
            (slot) =>
                slot.portalCard !== null &&
                slot.bakugans.length > 0 &&
                slot.bakugans.some(
                    (b) =>
                        b.userId !== bakugan.userId &&
                        b.currentPower < bakugan.currentPower
                )
        )

        if (slotsWithOpponent.length === 0) return false

        if (slotsWithOpponent.length === 0) return false

        const slotOfUser = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        const opponents = slotOfUser.bakugans.filter((b) => b.userId !== bakugan.userId)
        if (opponents.length > 0) return false

        return true
    },

}