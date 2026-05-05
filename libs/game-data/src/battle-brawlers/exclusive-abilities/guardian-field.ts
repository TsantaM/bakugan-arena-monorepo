import { ProtectCardEffect } from "../../function/index.js";
import { Slots } from "../../store/slots.js";
import { exclusiveAbilitiesType } from "../../type/game-data-types.js";
import { bakuganOnSlot, portalSlotsType, portalSlotsTypeElement } from "../../type/room-types.js";
import { JuggernoidHaos } from "../bakugans/juggernoid.js";

export const GardianField: exclusiveAbilitiesType = {
    key: 'guardian-field',
    name: 'Guardian Field',
    description: 'Protect all allie Bakugan on the field against abilities and gate cards effects',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {

        const slots: portalSlotsType = roomState.protalSlots
        const bakugans: bakuganOnSlot[] = slots.map((s) => s.bakugans).flat().filter((b) => b.userId === userId)
        const slotOfGate: portalSlotsTypeElement = slots[Slots.indexOf(slot)]
        const user: bakuganOnSlot | undefined = slotOfGate.bakugans.find((b) => b.userId === userId && b.key === bakuganKey)
        if (!user) return null

        ProtectCardEffect({
            bakugan: user,
            cardKey: GardianField.key,
            origin: 'ABILITY',
            protectionType: 'BOTH',
            roomState: roomState,
        })

        bakugans.forEach((b) => {
            ProtectCardEffect({
                bakugan: b,
                cardKey: GardianField.key,
                origin: 'ABILITY',
                protectionType: 'BOTH',
                roomState: roomState,
            })
        })


        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        const slots: portalSlotsType = roomState.protalSlots
        const bakugans: bakuganOnSlot[] = slots.map((s) => s.bakugans).flat().filter((b) => b.userId === userId && b.statut.protected && b.statut.protected.key === GardianField.key)
        const slotOfGate: portalSlotsTypeElement = slots[Slots.indexOf(slot)]
        const user: bakuganOnSlot | undefined = slotOfGate.bakugans.find((b) => b.userId === userId && b.key === bakuganKey)

        if (!user) return
        if (user.statut.protected && user.statut.protected.key === GardianField.key && user.statut.protected.origin === 'ABILITY') {
            user.statut.protected = false
        }

        bakugans.forEach((b) => {
            if (b.statut.protected && b.statut.protected.key === GardianField.key && b.statut.protected.origin === 'ABILITY') b.statut.protected = false
        })

    },
    activationConditions({ roomState, userId }) {

        const slots: portalSlotsType = roomState.protalSlots
        const bakugans: bakuganOnSlot[] = slots.map((s) => s.bakugans).flat().filter((b) => b.userId === userId).filter((b) => !b.statut.protected)

        if (bakugans.length === 0) return false

        return true
    },
    canUse({ bakugan }) {
        if (bakugan.key !== JuggernoidHaos.key) return false
        return true
    },
}