import { attribut } from "../../type/game-data-types";
import { portalSlotsType } from "../../type/room-types";

export function CombinationTripleEffect({ userId, attribut_one, attribut_tree, attribut_two, portalSlots }: { userId: string, attribut_one: attribut, attribut_two: attribut, attribut_tree: attribut, portalSlots: portalSlotsType }) {
    const usersBakugan = portalSlots.filter((s) => s.bakugans.length > 0 && s.portalCard !== null && !s.can_set).map((b) => b.bakugans).flat().filter((b) => b.userId === userId).map((b) => b.attribut)

    if (usersBakugan) {
        if (usersBakugan.includes(attribut_one) && usersBakugan.includes(attribut_two) && usersBakugan.includes(attribut_tree)) {
            portalSlots.forEach((s) => {
                const targets = s.bakugans.filter((b) => b.userId === userId)
                targets.forEach((b) => b.currentPower += 200)
            })
        }
    }
}