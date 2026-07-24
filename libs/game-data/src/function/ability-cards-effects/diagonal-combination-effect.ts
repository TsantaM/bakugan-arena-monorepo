import { BakuganList } from "../../battle-brawlers/bakugans.js";
import { Slots } from "../../store/slots.js";
import type { AnimationDirectivesTypes, attribut, portalSlotsType, portalSlotsTypeElement, stateType } from "../../type/type-index.js";
import { PowerChange } from "./power-change.js";

export function DiagonalCombinationEffect({ slotOfGate, bakuganKey, userId, attribut, attributWeak, portalSlots, animations, turn, roomState }: { slotOfGate: portalSlotsTypeElement, bakuganKey: string, userId: string, attribut: attribut, attributWeak: attribut, portalSlots: portalSlotsType, animations: AnimationDirectivesTypes[], turn: number, roomState: stateType }) {
    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    const userSecondAttribut = BakuganList.find((b) => b.key === user?.key)
    const userAttribut = [user?.attribut, userSecondAttribut?.seconaryAttribut]

    const { slot } = roomState.battleState

    const keys = portalSlots.map((p) => p.bakugans).flat().map((p) => p.key)
    const bakuganOnDomainSecondAttributs = BakuganList.filter((b) => keys.includes(b.key)).map((b) => b.seconaryAttribut)
    const bakuganOnDomainAttributs = [portalSlots.map((p) => p.bakugans).flat().map((p) => p.attribut), bakuganOnDomainSecondAttributs].flat()
    if (user && userAttribut && bakuganOnDomainAttributs) {

        if ((userAttribut.includes(attribut)) && bakuganOnDomainAttributs.includes(attributWeak)) {

            if (user.slot_id === slot) {
                PowerChange({
                    roomState,
                    bakugan: user,
                    G: 150,
                    malus: false,
                })
            } else {
                if(!slot) return
                const slotOfBattle = roomState.protalSlots[Slots.indexOf(slot)]

                const bakuganOnBattleSlot = slotOfBattle.bakugans.find((b) => b.userId === userId && (
                    b.attribut === attribut ||
                    b.attribut === attributWeak ||
                    b.secondAttribut === attribut ||
                    b.secondAttribut === attributWeak
                ))

                if(!bakuganOnBattleSlot) return

                PowerChange({
                    roomState,
                    bakugan: bakuganOnBattleSlot,
                    G: 150,
                    malus: false,
                })
            }

        }
    }

}
