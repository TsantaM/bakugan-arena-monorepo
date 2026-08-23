import { bakuganOnSlot, portalSlotsTypeElement, stateType } from "../../type/room-types.js"
import { AddRenfortAnimationDirective } from "../create-animation-directives/add-renfort-directive.js"
import RemoveRenfortAnimationDirective from "../create-animation-directives/remove-renfort-animation-directive.js"

type CheckRenfortOnMoveProps = {
    roomState: stateType
    bakugan: bakuganOnSlot
    slot: portalSlotsTypeElement
    direction: 'leave' | 'enter'
    enabled?: boolean
}

export function checkRenfortOnMove({
    roomState,
    bakugan,
    slot,
    direction,
    enabled = true,
}: CheckRenfortOnMoveProps): void {
    if (!enabled) return

    const { battleInProcess, paused, slot: battleSlot } = roomState.battleState
    if (!battleInProcess || battleSlot !== slot.id) return

    const turnCount = roomState.turnState.turnCount

    if (direction === 'leave') {
        if (paused) return

        const hasTeammate = slot.bakugans.some(
            (b) => b.userId === bakugan.userId && b.key !== bakugan.key
        )
        if (!hasTeammate) return

        RemoveRenfortAnimationDirective({
            animations: roomState.animations,
            bakugan: structuredClone(bakugan),
            turnCount,
            roomState,
        })
        return
    }

    const hasTeammate = slot.bakugans.some((b) => b.userId === bakugan.userId)
    if (!hasTeammate) return

    AddRenfortAnimationDirective({
        animations: roomState.animations,
        roomState,
        bakugan,
        slot,
        turn: turnCount,
    })
}
