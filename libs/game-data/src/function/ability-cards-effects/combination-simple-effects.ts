import { attribut } from "../../type/game-data-types"
import { portalSlotsTypeElement } from "../../type/room-types"

export function CombinationSimpleFunction({slotOfGate, bakuganKey, userId, attribut, attributWeak} : {slotOfGate: portalSlotsTypeElement, bakuganKey: string, userId: string, attribut: attribut, attributWeak: attribut}) {
    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    const userAttribut = user?.attribut
    const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
    const opponentsAttributs = opponents.map((o) => o.attribut)

    if (user && userAttribut && opponents && opponentsAttributs) {
        if (userAttribut === attribut && opponentsAttributs.includes(attributWeak)) {
            user.currentPower += 100
        }
    }
}