import { AbilityCardsList } from "../../battle-brawlers/ability-cards.js"
import { ExclusiveAbilitiesList } from "../../battle-brawlers/exclusive-abilities.js"
import { GateCardsList } from "../../battle-brawlers/gate-gards.js"
import type { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import type { replaySnapshotType } from "../../type/replay-snapshot-types.js"
import type { slots_id, stateType } from "../../type/room-types.js"

function emptyActiveRequest(): stateType["ActivePlayerActionRequest"] {
    return {
        target: "ACTIVE_PLAYER",
        actions: { mustDo: [], mustDoOne: [], optional: [] },
    }
}

function emptyInactiveRequest(): stateType["InactivePlayerActionRequest"] {
    return {
        target: "INACTIVE_PLAYER",
        actions: { mustDo: [], mustDoOne: [], optional: [] },
    }
}

/** Minimal mutable room state so card `onActivate` / `onOpen` can push real directives. */
export function sandboxSnapshotToPreviewRoomState(
    snapshot: replaySnapshotType,
): stateType {
    const playerIds = snapshot.decksState.map((d) => d.userId)

    return {
        connectedsUsers: new Map(),
        spectators: new Map(),
        messages: [],
        roomId: "sandbox-anim-lab",
        ranked: false,
        players: playerIds.map((userId) => ({
            userId,
            usable_gates: 3,
            usable_abilitys: 3,
            username: userId,
            timer: 5 * 60,
        })),
        turnState: structuredClone(snapshot.turnState),
        persistantAbilities: [],
        battleState: structuredClone(snapshot.battleState),
        decksState: structuredClone(snapshot.decksState),
        protalSlots: structuredClone(snapshot.portalSlots),
        status: {
            finished: false,
            finisheAt: null,
            winner: null,
            elo: null,
        },
        animations: [],
        animationsForReplay: [],
        initialReplaySnapshot: structuredClone(snapshot),
        InactivePlayerActionRequest: emptyInactiveRequest(),
        ActivePlayerActionRequest: emptyActiveRequest(),
        AbilityAditionalRequest: [],
        gateCardActionRequest: [],
        createdAt: Date.now(),
    }
}

export type PreviewSandboxAbilityInput = {
    snapshot: replaySnapshotType
    abilityKey: string
    userId: string
    bakuganKey: string
    slotId: slots_id
}

/**
 * Same path as the live server: ACTIVE_ABILITY_CARD then card.onActivate(...).
 * Returns the animation queue that would be sent to the gameboard.
 */
export function previewSandboxAbilityAnimations({
    snapshot,
    abilityKey,
    userId,
    bakuganKey,
    slotId,
}: PreviewSandboxAbilityInput): {
    animations: AnimationDirectivesTypes[]
    error?: "ability_not_found" | "bakugan_not_found" | "no_animations"
} {
    const ability =
        AbilityCardsList.find((c) => c.key === abilityKey) ??
        ExclusiveAbilitiesList.find((c) => c.key === abilityKey)

    if (!ability) return { animations: [], error: "ability_not_found" }

    const roomState = sandboxSnapshotToPreviewRoomState(snapshot)
    const slot = roomState.protalSlots.find((s) => s.id === slotId)
    const bakugan = slot?.bakugans.find(
        (b) => b.key === bakuganKey && b.userId === userId,
    )

    if (!bakugan || !slot) {
        return { animations: [], error: "bakugan_not_found" }
    }

    const activeCardAnimation: AnimationDirectivesTypes = {
        type: "ACTIVE_ABILITY_CARD",
        resolve: false,
        data: {
            card: ability.key,
            attribut: bakugan.attribut,
        },
        message: [],
    }

    roomState.animations.push(activeCardAnimation)

    try {
        ability.onActivate({
            roomState,
            roomId: roomState.roomId,
            userId,
            bakuganKey,
            slot: slotId,
        })
    } catch {
        // Some cards need extra battle context; still return what was queued.
    }

    if (roomState.animations.length === 0) {
        return { animations: [], error: "no_animations" }
    }

    return { animations: structuredClone(roomState.animations) }
}

export type PreviewSandboxGateInput = {
    snapshot: replaySnapshotType
    slotId: slots_id
    bakuganKey?: string
    userId?: string
}

/** OPEN_GATE_CARD + gate.onOpen (same visual path as a real open). */
export function previewSandboxGateAnimations({
    snapshot,
    slotId,
    bakuganKey,
    userId,
}: PreviewSandboxGateInput): {
    animations: AnimationDirectivesTypes[]
    error?: "gate_not_found" | "no_animations"
} {
    const roomState = sandboxSnapshotToPreviewRoomState(snapshot)
    const slot = roomState.protalSlots.find((s) => s.id === slotId)

    if (!slot?.portalCard) {
        return { animations: [], error: "gate_not_found" }
    }

    const gate = GateCardsList.find((g) => g.key === slot.portalCard!.key)
    if (!gate) return { animations: [], error: "gate_not_found" }

    roomState.animations.push({
        type: "OPEN_GATE_CARD",
        data: {
            slotId: slot.id,
            slot: structuredClone(slot),
        },
        message: [],
        resolved: false,
    })

    slot.state.open = true

    try {
        gate.onOpen({
            roomState,
            slot: slotId,
            bakuganKey,
            userId,
        })
    } catch {
        // ignore
    }

    if (roomState.animations.length === 0) {
        return { animations: [], error: "no_animations" }
    }

    return { animations: structuredClone(roomState.animations) }
}
