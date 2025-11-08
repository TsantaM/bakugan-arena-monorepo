import { BakuganList } from "../../battle-brawlers/bakugans";
import { type attribut } from "../../type/game-data-types";
import { type portalSlotsType } from "../../type/room-types";

export function CombinationTripleEffect({ userId, attribut_one, attribut_tree, attribut_two, portalSlots }: { userId: string, attribut_one: attribut, attribut_two: attribut, attribut_tree: attribut, portalSlots: portalSlotsType }) {
    const keys = portalSlots.filter((s) => s.bakugans.length > 0 && s.portalCard !== null && !s.can_set).map((b) => b.bakugans).flat().filter((b) => b.userId === userId).map((b) => b.key)
    const secondAttributs = BakuganList.filter((b) => keys.includes(b.key)).map((b) => b.seconaryAttribut)
    const usersBakugan = [portalSlots.filter((s) => s.bakugans.length > 0 && s.portalCard !== null && !s.can_set).map((b) => b.bakugans).flat().filter((b) => b.userId === userId).map((b) => b.attribut), secondAttributs].flat()

    if (usersBakugan) {
        if (usersBakugan.includes(attribut_one) && usersBakugan.includes(attribut_two) && usersBakugan.includes(attribut_tree)) {
            portalSlots.forEach((s) => {
                const targets = s.bakugans.filter((b) => b.userId === userId)
                targets.forEach((b) => b.currentPower += 200)
            })
        }
    }
}