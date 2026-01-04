import { stateType, type portalSlotsTypeElement } from "../../type/room-types";
import { BakuganList } from '../../battle-brawlers/bakugans'
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/power-change";

export function CaracterGateCardEffect({ roomState, slotOfGate, family }: { roomState: stateType, slotOfGate: portalSlotsTypeElement | undefined, family: string }) {
    if (!roomState) return
    if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
        console.log(slotOfGate)
        const bakugansTarget = slotOfGate.bakugans.filter((b) => b.family === family)
        console.log('bakuganTargets', bakugansTarget)
        bakugansTarget.forEach((b) => {
            const basePower = structuredClone(b.currentPower)
            if (!basePower) return
            b.currentPower += basePower
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [b],
                powerChange: basePower,
                malus: false
            })
        })
        slotOfGate.state.open = true
    }
}

export function CancelCaracterGateCard({ roomState, slotOfGate, family }: { roomState: stateType, slotOfGate: portalSlotsTypeElement | undefined, family: string }) {
    if (!roomState) return
    if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
        console.log(slotOfGate)
        const bakugansTarget = slotOfGate.bakugans.filter((b) => b.family === family)
        console.log('bakuganTargets', bakugansTarget)
        bakugansTarget.forEach((b) => {
            const basePower = structuredClone(b.powerLevel)
            if (!basePower) return
            b.currentPower -= basePower
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [b],
                powerChange: basePower,
                malus: true
            })
        })
        slotOfGate.state.canceled = true
    }
}