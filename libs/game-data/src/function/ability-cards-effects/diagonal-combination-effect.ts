import { attribut } from "../../type/game-data-types";
import { portalSlotsType, portalSlotsTypeElement } from "../../type/room-types";

export function DiagonalCombinationEffect({ slotOfGate, bakuganKey, userId, attribut, attributWeak, portalSlots }: { slotOfGate: portalSlotsTypeElement, bakuganKey: string, userId: string, attribut: attribut, attributWeak: attribut, portalSlots: portalSlotsType }) {
    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    const userAttribut = user?.attribut
    const bakuganOnDomainAttributs = portalSlots.map((p) => p.bakugans).flat().map((p) => p.attribut)

    if (user && userAttribut && bakuganOnDomainAttributs) {
        if (userAttribut === attribut && bakuganOnDomainAttributs.includes(attributWeak)) {
            user.currentPower += 150
        }
    }
}