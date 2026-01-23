import { BakuganList } from "../../battle-brawlers/bakugans.js"
import type { attribut, bakuganOnSlot, portalSlotsTypeElement, slots_id, stateType } from "../../type/type-index.js"
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js"

export function ElementaryGateCardOnOpen({ roomState, slot, attribut }: { roomState: stateType, slot: slots_id, attribut: attribut }) {
    if (!roomState) return
    const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)

    if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
        const keys = slotOfGate.bakugans.map((b) => b.key)
        const secondAttributs = BakuganList.filter((b) => keys.includes(b.key) && b.seconaryAttribut === attribut).map((b) => b.key)
        const bakuganWithAttribut = [slotOfGate.bakugans.filter((b) => b.attribut === attribut), slotOfGate.bakugans.filter((b) => secondAttributs.includes(b.key))].flat()
        slotOfGate.state.open = true
        let bakugans: bakuganOnSlot[] = []
        bakuganWithAttribut.forEach((b) => {
            b.currentPower += 100
            bakugans.push(b)
        })
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: bakugans,
            powerChange: 100,
            malus: false
        })
    }

}

export function ElementaryGateCardOnCancel({ roomState, slot, attribut }: { roomState: stateType, slot: slots_id, attribut: attribut }) {
    if (!roomState) return
    const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
    if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
        const keys = slotOfGate.bakugans.map((b) => b.key)
        const secondAttributs = BakuganList.filter((b) => keys.includes(b.key) && b.seconaryAttribut === attribut).map((b) => b.key)
        const bakuganWithAttribut = [slotOfGate.bakugans.filter((b) => b.attribut === attribut), slotOfGate.bakugans.filter((b) => secondAttributs.includes(b.key))].flat()
        slotOfGate.state.canceled = true
        let bakugans: bakuganOnSlot[] = []
        bakuganWithAttribut.forEach((b) => {
            b.currentPower -= 100
            bakugans.push(b)
        })
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: bakugans,
            powerChange: 100,
            malus: true
        })
    }
}

export function PerilGateCardOnOpen({ roomState, slot, attribut, exception }: { roomState: stateType, slot: slots_id, attribut: attribut, exception: attribut }) {
    const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
    if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
        const keys = slotOfGate.bakugans.map((b) => b.key)
        const secondAttributs = BakuganList.filter((b) => keys.includes(b.key) && b.seconaryAttribut !== exception).map((b) => b.key)
        const bakuganOnGate = [slotOfGate.bakugans.filter((b) => b.attribut !== exception), slotOfGate.bakugans.filter((b) => secondAttributs.includes(b.key))].flat()

        bakuganOnGate.forEach((b) => b.attribut = attribut)
        slotOfGate.state.open = true

    }

}

export function PerilGateCardOnCanel({ roomState, slot }: { roomState: stateType, slot: slots_id }) {
    const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
    if (slotOfGate && slotOfGate.state.open && !slotOfGate.state.canceled) {
        const bakuganOnGate = slotOfGate.bakugans
        slotOfGate.state.open = true
        bakuganOnGate.forEach((b) => {
            const attribut = BakuganList.find((ba) => ba.key === b.key)?.attribut

            if (attribut) {
                b.attribut = attribut
            }
        })

        slotOfGate.state.canceled = true

    }

}

export function DoubleBakuganCheck({ portalSlot }: { portalSlot: portalSlotsTypeElement }) {
    const bakugansOnSlot = portalSlot.bakugans.length
    if (bakugansOnSlot >= 2) {
        return true
    } else {
        return false
    }
}