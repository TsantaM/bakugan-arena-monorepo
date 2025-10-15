import { BakuganList } from "../../battle-brawlers/bakugans";
import { attribut } from "../../type/game-data-types";
import { portalSlotsType, portalSlotsTypeElement } from "../../type/room-types";

export function DiagonalCombinationEffect({ slotOfGate, bakuganKey, userId, attribut, attributWeak, portalSlots }: { slotOfGate: portalSlotsTypeElement, bakuganKey: string, userId: string, attribut: attribut, attributWeak: attribut, portalSlots: portalSlotsType }) {
    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    const userSecondAttribut = BakuganList.find((b) => b.key === user?.key)
    const userAttribut = [user?.attribut, userSecondAttribut?.seconaryAttribut]

    const keys = portalSlots.map((p) => p.bakugans).flat().map((p) => p.key)
    const bakuganOnDomainSecondAttributs = BakuganList.filter((b) => keys.includes(b.key)).map((b) => b.seconaryAttribut)
    const bakuganOnDomainAttributs = [portalSlots.map((p) => p.bakugans).flat().map((p) => p.attribut), bakuganOnDomainSecondAttributs].flat()
    if (user && userAttribut && bakuganOnDomainAttributs) {
        if (userAttribut.includes(attribut) && bakuganOnDomainAttributs.includes(attributWeak)) {
            user.currentPower += 150
        }
    }
}