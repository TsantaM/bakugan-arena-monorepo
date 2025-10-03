import { portalSlotsTypeElement } from "../../type/room-types";
import { BakuganList } from '../../battle-brawlers/bakugans'

export function CaracterGateCardEffect({ slotOfGate, family }: { slotOfGate: portalSlotsTypeElement | undefined, family: string }) {
    if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
        console.log(slotOfGate)
        const bakugansTarget = slotOfGate.bakugans.filter((b) => b.family === family)
        console.log('bakuganTargets', bakugansTarget)
        bakugansTarget.forEach((b) => {
            const basePower = BakuganList.find((l) => l.key === b.key && l.family === family)?.powerLevel
            if(!basePower) return
            b.currentPower += basePower
        })
        slotOfGate.state.open = true
    }
}