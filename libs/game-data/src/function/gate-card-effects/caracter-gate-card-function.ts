import { stateType, type portalSlotsTypeElement } from "../../type/type-index.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js";

export function CaracterGateCardEffect({ roomState, slotOfGate, family }: { roomState: stateType, slotOfGate: portalSlotsTypeElement | undefined, family: string }) {
    if (!roomState) return
    if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
        const bakugansTarget = slotOfGate.bakugans.filter((b) => b.family === family)
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
        const bakugansTarget = slotOfGate.bakugans.filter((b) => b.family === family)
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