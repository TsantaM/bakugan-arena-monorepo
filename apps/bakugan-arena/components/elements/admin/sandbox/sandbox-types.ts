import type { slots_id } from "@bakugan-arena/game-data"
import {
    SANDBOX_OPPONENT_ID,
    SANDBOX_USER_ID,
} from "@bakugan-arena/game-data"

export type SandboxOwner = "user" | "opponent"

export type SandboxBakuganDraft = {
    localId: string
    bakuganKey: string
    owner: SandboxOwner
    currentPower: number
    abilityBlock: boolean
}

export type SandboxAbilityDraft = {
    localId: string
    abilityKey: string
    bakuganLocalId: string
}

export type SandboxSlotDraft = {
    id: slots_id
    gateKey: string | null
    gateOwner: SandboxOwner
    open: boolean
    canSet: boolean
    bakugans: SandboxBakuganDraft[]
    activateAbilities: SandboxAbilityDraft[]
}

export type SandboxActionAbilityDraft = {
    localId: string
    abilityKey: string
    bakuganKey: string
    slotId: slots_id
}

export type SandboxDraft = {
    userId: string
    opponentId: string
    slots: SandboxSlotDraft[]
    battleInProcess: boolean
    battleSlot: slots_id | null
    battleTurns: number
    battlePaused: boolean
    turnOwner: SandboxOwner
    turnCount: number
    setNewGate: boolean
    setNewBakugan: boolean
    useAbilityCard: boolean
    eliminatedUser: number
    eliminatedOpponent: number
    /** Cartes d'abilité proposées dans l'UI d'action (comme test.ts) */
    actionAbilities: SandboxActionAbilityDraft[]
    showActionUi: boolean
}

export function ownerToUserId(
    owner: SandboxOwner,
    draft: Pick<SandboxDraft, "userId" | "opponentId">,
): string {
    return owner === "user" ? draft.userId : draft.opponentId
}

export function createEmptySandboxDraft(): SandboxDraft {
    const slotIds: slots_id[] = [
        "slot-1",
        "slot-2",
        "slot-3",
        "slot-4",
        "slot-5",
        "slot-6",
    ]

    return {
        userId: SANDBOX_USER_ID,
        opponentId: SANDBOX_OPPONENT_ID,
        slots: slotIds.map((id, index) => ({
            id,
            gateKey: null,
            gateOwner: "user",
            open: false,
            canSet: index === 1,
            bakugans: [],
            activateAbilities: [],
        })),
        battleInProcess: false,
        battleSlot: null,
        battleTurns: 0,
        battlePaused: false,
        turnOwner: "user",
        turnCount: 1,
        setNewGate: true,
        setNewBakugan: true,
        useAbilityCard: true,
        eliminatedUser: 0,
        eliminatedOpponent: 0,
        actionAbilities: [],
        showActionUi: false,
    }
}
