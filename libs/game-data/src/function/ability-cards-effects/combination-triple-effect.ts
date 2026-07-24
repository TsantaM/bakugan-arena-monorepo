import { BakuganList } from "../../battle-brawlers/bakugans.js";
import { AnimationDirectivesTypes, attribut, portalSlotsType, stateType } from "../../type/type-index.js";
import { PowerChange } from "./power-change.js";

export function CombinationTripleEffect({ roomState, animations, userId, attribut_one, attribut_tree, attribut_two, portalSlots, turn }: { roomState: stateType, animations: AnimationDirectivesTypes[], userId: string, attribut_one: attribut, attribut_two: attribut, attribut_tree: attribut, portalSlots: portalSlotsType, turn: number }) {
    const keys = portalSlots.filter((s) => s.bakugans.length > 0 && s.portalCard !== null && !s.can_set).map((b) => b.bakugans).flat().filter((b) => b.userId === userId).map((b) => b.key)
    const secondAttributs = BakuganList.filter((b) => keys.includes(b.key)).map((b) => b.seconaryAttribut)
    const usersBakugan = [portalSlots.filter((s) => s.bakugans.length > 0 && s.portalCard !== null && !s.can_set).map((b) => b.bakugans).flat().filter((b) => b.userId === userId).map((b) => b.attribut), secondAttributs].flat()

    if (usersBakugan) {
        if (usersBakugan.includes(attribut_one) && usersBakugan.includes(attribut_two) && usersBakugan.includes(attribut_tree)) {
            portalSlots.forEach((s) => {
                const targets = s.bakugans.filter((b) => b.userId === userId)
                targets.forEach((b) => {
                    PowerChange({
                        roomState,
                        bakugan: b,
                        G: 200,
                        malus: false,
                    })
                })
            })
        }
    }
}
