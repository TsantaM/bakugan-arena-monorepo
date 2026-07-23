import {
    previewSandboxAbilityAnimations,
    previewSandboxGateAnimations,
    type AnimationDirectivesTypes,
    type attribut,
    type slots_id,
} from "@bakugan-arena/game-data"
import { draftToSandboxSnapshot } from "./sandbox-draft"
import { ownerToUserId, type SandboxDraft } from "./sandbox-types"

export type SandboxAnimLabMode = "ability" | "gate" | "custom" | "changeAttribut"

export const SANDBOX_ATTRIBUTS: attribut[] = [
    "Pyrus",
    "Aquos",
    "Darkus",
    "Haos",
    "Subterra",
    "Ventus",
]

export type BuildSandboxAnimationBatchInput = {
    draft: SandboxDraft
    mode: SandboxAnimLabMode
    cardKey: string | null
    sourceBakuganLocalId: string | null
    slotId: string | null
    targetAttribut: attribut | null
    /** Only used for raw custom override. */
    customAnimationKeys: string[]
}

/**
 * Builds the animation queue the selected card would push into roomState.animations
 * (ACTIVE_ABILITY_CARD + onActivate / OPEN_GATE_CARD + onOpen), using the sandbox draft as game state.
 */
export function buildSandboxAnimationBatch({
    draft,
    mode,
    cardKey,
    sourceBakuganLocalId,
    slotId,
    targetAttribut,
    customAnimationKeys,
}: BuildSandboxAnimationBatchInput): {
    animations: AnimationDirectivesTypes[]
    errorKey?: string
} {
    const snapshot = draftToSandboxSnapshot(draft)

    if (mode === "changeAttribut") {
        if (!sourceBakuganLocalId) {
            return { animations: [], errorKey: "animLab.errors.sourceRequired" }
        }
        if (!targetAttribut) {
            return { animations: [], errorKey: "animLab.errors.attributRequired" }
        }

        for (const slot of draft.slots) {
            const index = slot.bakugans.findIndex(
                (b) => b.localId === sourceBakuganLocalId,
            )
            if (index < 0) continue

            const portal = snapshot.portalSlots.find((s) => s.id === slot.id)
            const bakugan = portal?.bakugans[index]
            if (!bakugan) break

            return {
                animations: [
                    {
                        type: "CHANGE_ATTRIBUT",
                        resolve: false,
                        data: {
                            bakugan,
                            attribut: targetAttribut,
                        },
                        message: [],
                    },
                ],
            }
        }

        return { animations: [], errorKey: "animLab.errors.sourceRequired" }
    }

    if (mode === "gate") {
        if (!slotId) return { animations: [], errorKey: "animLab.errors.slotRequired" }

        const slot = draft.slots.find((s) => s.id === slotId)
        if (!slot?.gateKey) {
            return { animations: [], errorKey: "animLab.errors.gateRequired" }
        }

        const source = sourceBakuganLocalId
            ? slot.bakugans.find((b) => b.localId === sourceBakuganLocalId)
            : slot.bakugans[0]

        const result = previewSandboxGateAnimations({
            snapshot,
            slotId: slotId as slots_id,
            bakuganKey: source?.bakuganKey,
            userId: source
                ? ownerToUserId(source.owner, draft)
                : draft.userId,
        })

        if (result.error === "gate_not_found") {
            return { animations: [], errorKey: "animLab.errors.gateRequired" }
        }
        if (result.animations.length === 0) {
            return { animations: [], errorKey: "animLab.errors.nothingToPlay" }
        }

        return { animations: result.animations }
    }

    if (!cardKey) {
        return { animations: [], errorKey: "animLab.errors.cardRequired" }
    }

    if (mode === "custom") {
        if (!customAnimationKeys.includes(cardKey)) {
            return { animations: [], errorKey: "animLab.errors.unknownCustom" }
        }

        if (!sourceBakuganLocalId) {
            return { animations: [], errorKey: "animLab.errors.sourceRequired" }
        }

        // Reuse ability preview path when the custom key is also a card,
        // otherwise emit a single CUSTOM_ANIMATION from the board bakugan.
        const abilityPreview = (() => {
            for (const slot of draft.slots) {
                const bakugan = slot.bakugans.find(
                    (b) => b.localId === sourceBakuganLocalId,
                )
                if (!bakugan) continue
                return previewSandboxAbilityAnimations({
                    snapshot,
                    abilityKey: cardKey,
                    userId: ownerToUserId(bakugan.owner, draft),
                    bakuganKey: bakugan.bakuganKey,
                    slotId: slot.id,
                })
            }
            return null
        })()

        if (abilityPreview && abilityPreview.animations.length > 0) {
            return { animations: abilityPreview.animations }
        }

        // Fallback: raw CUSTOM_ANIMATION only
        for (const slot of draft.slots) {
            const index = slot.bakugans.findIndex(
                (b) => b.localId === sourceBakuganLocalId,
            )
            if (index < 0) continue
            const portal = snapshot.portalSlots.find((s) => s.id === slot.id)
            const sourceBakugan = portal?.bakugans[index]
            if (!sourceBakugan) break

            return {
                animations: [
                    {
                        type: "CUSTOM_ANIMATION",
                        data: {
                            animationKey: cardKey,
                            sourceBakugan,
                            slotId: sourceBakugan.slot_id,
                        },
                        message: [],
                        resolved: false,
                    },
                ],
            }
        }

        return { animations: [], errorKey: "animLab.errors.sourceRequired" }
    }

    // mode === "ability" — real server path: overlay + onActivate effects
    if (!sourceBakuganLocalId) {
        return { animations: [], errorKey: "animLab.errors.sourceRequired" }
    }

    for (const slot of draft.slots) {
        const bakugan = slot.bakugans.find(
            (b) => b.localId === sourceBakuganLocalId,
        )
        if (!bakugan) continue

        const result = previewSandboxAbilityAnimations({
            snapshot,
            abilityKey: cardKey,
            userId: ownerToUserId(bakugan.owner, draft),
            bakuganKey: bakugan.bakuganKey,
            slotId: slot.id,
        })

        if (result.error === "ability_not_found") {
            return { animations: [], errorKey: "animLab.errors.cardRequired" }
        }
        if (result.error === "bakugan_not_found") {
            return { animations: [], errorKey: "animLab.errors.sourceRequired" }
        }
        if (result.animations.length === 0) {
            return { animations: [], errorKey: "animLab.errors.nothingToPlay" }
        }

        return { animations: result.animations }
    }

    return { animations: [], errorKey: "animLab.errors.sourceRequired" }
}
