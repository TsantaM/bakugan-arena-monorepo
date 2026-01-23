import { BakuganList } from "../../battle-brawlers/bakugans.js";
import type { AnimationDirectivesTypes, attribut, portalSlotsType, portalSlotsTypeElement } from "../../type/type-index.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/power-change.js";

export function DiagonalCombinationEffect({ slotOfGate, bakuganKey, userId, attribut, attributWeak, portalSlots, animations }: { slotOfGate: portalSlotsTypeElement, bakuganKey: string, userId: string, attribut: attribut, attributWeak: attribut, portalSlots: portalSlotsType, animations: AnimationDirectivesTypes[] }) {
    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    const userSecondAttribut = BakuganList.find((b) => b.key === user?.key)
    const userAttribut = [user?.attribut, userSecondAttribut?.seconaryAttribut]

    const keys = portalSlots.map((p) => p.bakugans).flat().map((p) => p.key)
    const bakuganOnDomainSecondAttributs = BakuganList.filter((b) => keys.includes(b.key)).map((b) => b.seconaryAttribut)
    const bakuganOnDomainAttributs = [portalSlots.map((p) => p.bakugans).flat().map((p) => p.attribut), bakuganOnDomainSecondAttributs].flat()
    if (user && userAttribut && bakuganOnDomainAttributs) {
        if (userAttribut.includes(attribut) && bakuganOnDomainAttributs.includes(attributWeak)) {
            user.currentPower += 150
            PowerChangeDirectiveAnumation({
                animations: animations,
                bakugans: [user],
                powerChange: 150,
                malus: false
            })
        }
    }
}