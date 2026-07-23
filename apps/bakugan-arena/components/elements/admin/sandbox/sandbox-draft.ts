import {
    AbilityCards,
    AbilityCardsList,
    Bakugans,
    createBakuganOnSlot,
    createEmptySandboxSnapshot,
    ExclusiveAbilities,
    ExclusiveAbilitiesList,
    type ActivePlayerActionRequestType,
    type activateAbilities,
    type attribut,
    type portalSlotsTypeElement,
    type replaySnapshotType,
    type slots_id,
} from "@bakugan-arena/game-data"
import {
    createEmptySandboxDraft,
    ownerToUserId,
    type SandboxAbilityDraft,
    type SandboxBakuganDraft,
    type SandboxDraft,
    type SandboxOwner,
    type SandboxSlotDraft,
} from "./sandbox-types"

function newLocalId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function resolveAbilityCardData(abilityKey: string) {
    return (
        AbilityCards[abilityKey] ??
        ExclusiveAbilities[abilityKey] ??
        AbilityCardsList.find((c) => c.key === abilityKey) ??
        ExclusiveAbilitiesList.find((c) => c.key === abilityKey)
    )
}

function ownerFromUserId(userId: string, player1Id: string): SandboxOwner {
    return userId === player1Id ? "user" : "opponent"
}

/** Reconstruit un draft éditable depuis un snapshot de replay. */
export function snapshotToSandboxDraft(
    snapshot: replaySnapshotType,
    player1Id: string,
    player2Id: string,
): SandboxDraft {
    const base = createEmptySandboxDraft()
    const slotById = new Map(snapshot.portalSlots.map((slot) => [slot.id, slot]))

    const slots: SandboxSlotDraft[] = base.slots.map((slotDraft) => {
        const slot = slotById.get(slotDraft.id)
        if (!slot) return slotDraft

        const bakugans: SandboxBakuganDraft[] = slot.bakugans.map((bakugan) => ({
            localId: newLocalId(),
            bakuganKey: bakugan.key,
            owner: ownerFromUserId(bakugan.userId, player1Id),
            currentPower: bakugan.currentPower,
            abilityBlock: bakugan.abilityBlock,
        }))

        const activateAbilities: SandboxAbilityDraft[] = slot.activateAbilities.map(
            (ability) => {
                const bakugan =
                    bakugans.find((b) => b.bakuganKey === ability.bakuganKey) ??
                    bakugans[0]
                return {
                    localId: newLocalId(),
                    abilityKey: ability.key,
                    bakuganLocalId: bakugan?.localId ?? "",
                }
            },
        )

        return {
            id: slot.id,
            gateKey: slot.portalCard?.key ?? null,
            gateOwner: slot.portalCard
                ? ownerFromUserId(slot.portalCard.userId, player1Id)
                : "user",
            open: slot.state.open,
            canSet: slot.can_set,
            bakugans,
            activateAbilities,
        }
    })

    return {
        ...base,
        userId: player1Id,
        opponentId: player2Id,
        slots,
        battleInProcess: snapshot.battleState.battleInProcess,
        battleSlot: snapshot.battleState.slot,
        battleTurns: snapshot.battleState.turns,
        battlePaused: snapshot.battleState.paused,
        turnOwner: ownerFromUserId(snapshot.turnState.turn, player1Id),
        turnCount: snapshot.turnState.turnCount,
        setNewGate: snapshot.turnState.set_new_gate,
        setNewBakugan: snapshot.turnState.set_new_bakugan,
        useAbilityCard: snapshot.turnState.use_ability_card,
        eliminatedUser: snapshot.eliminated.user,
        eliminatedOpponent: snapshot.eliminated.opponnent,
        actionAbilities: [],
        showActionUi: false,
    }
}

export function draftToSandboxSnapshot(draft: SandboxDraft): replaySnapshotType {
    const base = createEmptySandboxSnapshot(draft.userId, draft.opponentId)

    const portalSlots: portalSlotsTypeElement[] = draft.slots.map((slot) => {
        const bakugans = slot.bakugans
            .map((b, index) =>
                createBakuganOnSlot({
                    key: b.bakuganKey,
                    userId: ownerToUserId(b.owner, draft),
                    slotId: slot.id,
                    id: index + 1,
                    currentPower: b.currentPower,
                    abilityBlock: b.abilityBlock,
                }),
            )
            .filter((b): b is NonNullable<typeof b> => b !== null)

        const activateAbilities: activateAbilities[] = slot.activateAbilities
            .map((ability, index) => {
                const bakugan = slot.bakugans.find((b) => b.localId === ability.bakuganLocalId)
                if (!bakugan) return null
                return {
                    id: index + 1,
                    key: ability.abilityKey,
                    userId: ownerToUserId(bakugan.owner, draft),
                    bakuganKey: bakugan.bakuganKey,
                    canceled: false,
                }
            })
            .filter((a): a is activateAbilities => a !== null)

        return {
            id: slot.id,
            can_set: slot.canSet,
            portalCard: slot.gateKey
                ? {
                      key: slot.gateKey,
                      userId: ownerToUserId(slot.gateOwner, draft),
                  }
                : null,
            bakugans,
            activateAbilities,
            state: {
                open: slot.open,
                canceled: false,
                blocked: false,
            },
        }
    })

    return {
        ...base,
        portalSlots,
        battleState: {
            battleInProcess: draft.battleInProcess,
            slot: draft.battleInProcess ? draft.battleSlot : null,
            turns: draft.battleTurns,
            paused: draft.battlePaused,
        },
        turnState: {
            ...base.turnState,
            turn: ownerToUserId(draft.turnOwner, draft),
            previous_turn:
                draft.turnOwner === "user" ? draft.opponentId : draft.userId,
            turnCount: draft.turnCount,
            set_new_gate: draft.setNewGate,
            set_new_bakugan: draft.setNewBakugan,
            use_ability_card: draft.useAbilityCard,
        },
        eliminated: {
            user: draft.eliminatedUser,
            opponnent: draft.eliminatedOpponent,
        },
    }
}

export function draftToActionRequest(
    draft: SandboxDraft,
): ActivePlayerActionRequestType | null {
    if (!draft.showActionUi || draft.actionAbilities.length === 0) {
        return null
    }

    const grouped = new Map<
        string,
        {
            attribut: attribut
            bakuganKey: string
            slot: slots_id
            abilities: {
                key: string
                name: string
                description: string
                image: string
            }[]
        }
    >()

    for (const entry of draft.actionAbilities) {
        const card = resolveAbilityCardData(entry.abilityKey)
        if (!card) continue

        const bakugan = Bakugans[entry.bakuganKey]
        const attributValue: attribut =
            card.attribut ?? bakugan?.attribut ?? "Darkus"
        const image =
            card.image ?? `ability_card_${attributValue.toUpperCase()}`

        const groupKey = `${entry.slotId}:${entry.bakuganKey}`
        const abilityPayload = {
            key: card.key,
            name: card.key,
            description: "",
            image,
        }

        const existing = grouped.get(groupKey)
        if (existing) {
            existing.abilities.push(abilityPayload)
        } else {
            grouped.set(groupKey, {
                attribut: attributValue,
                bakuganKey: entry.bakuganKey,
                slot: entry.slotId,
                abilities: [abilityPayload],
            })
        }
    }

    const data = [...grouped.values()]
    if (data.length === 0) return null

    return {
        target: "ACTIVE_PLAYER",
        actions: {
            mustDo: [
                {
                    type: "USE_ABILITY_CARD",
                    data,
                },
            ],
            mustDoOne: [],
            optional: [],
        },
    }
}
