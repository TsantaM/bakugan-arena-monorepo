import {
    AbilityCardsList,
    type activateAbilities,
    addBakuganToSlot,
    BakuganList,
    ExclusiveAbilitiesList,
    GateCardsList,
    type setBakuganProps,
    type stateType,
    Slots,
    type slots_id
} from "@bakugan-arena/game-data"

export const SimulateSetBakuganOnGate = ({
    roomState,
    bakuganKey,
    slot,
    userId
}: {
    roomState: stateType
} & Omit<setBakuganProps, "roomId">): stateType | undefined => {

    // ⚠️ travail sur copie locale (défense supplémentaire)
    let state = structuredClone(roomState)

    const usable_bakugan =
        state.decksState
            .find((d) => d.userId === userId)
            ?.bakugans.filter((b) => !b.bakuganData.onDomain && !b.bakuganData.elimined)
            .length ?? 3

    const usersBakuganOnGate =
        state.protalSlots
            .find((s) => s.id === slot)
            ?.bakugans.filter((b) => b.userId === userId)
            .length ?? 0

    const slotToUpdate = state.protalSlots.find((s) => s.id === slot)

    const isSlotUsable = slotToUpdate?.portalCard != null
    const canPlayerSetBakugan = state.turnState.set_new_bakugan
    const isNotPreviousTurn = state.turnState.previous_turn !== userId
    const hasNoBakuganOnSlot = usersBakuganOnGate < 1

    const canPlaceBakugan =
        isSlotUsable &&
        canPlayerSetBakugan &&
        isNotPreviousTurn &&
        hasNoBakuganOnSlot

    if (!canPlaceBakugan) return

    const deckToUpdate = state.decksState.find((s) => s.userId === userId)

    const bakuganFromDeck =
        deckToUpdate?.bakugans.find((b) => b.bakuganData.key === bakuganKey)
            ?.bakuganData

    const bakuganToAdd = BakuganList.find((b) => b.key === bakuganKey)

    if (!bakuganFromDeck || !bakuganToAdd) return

    const opponentsBakugans =
        state.decksState.find((d) => d.userId !== userId)?.bakugans

    const opponentsUsableBakugans =
        opponentsBakugans?.filter(
            (b) => !b.bakuganData.onDomain && !b.bakuganData.elimined
        ).length ?? 0

    const slotHasOpponentBakugan =
        slotToUpdate?.bakugans.some((b) => b.userId !== userId)

    const slotHasUserBakugan =
        slotToUpdate?.bakugans.some((b) => b.userId === userId)

    const isLastBakugan = usable_bakugan === 1
    const opponentHasUsableBakugan = opponentsUsableBakugans > 0

    const canPlace =
        !isLastBakugan ||
        (isLastBakugan &&
            (!opponentHasUsableBakugan
                ? slotHasOpponentBakugan && !slotHasUserBakugan
                : opponentHasUsableBakugan))

    if (!canPlace) return

    // 🔥 application pure (IMPORTANT)
    state = addBakuganToSlot({
        bakuganFromDeck,
        bakuganToAdd,
        roomData: state,
        slotId: slot as slots_id,
        userId
    })

    const slots = state.protalSlots

    const bakugan =
        slots[Slots.indexOf(slot as slots_id)]?.bakugans.find(
            (b) => b.key === bakuganKey && b.userId === userId
        )

    if (!bakugan) return state

    const updatedSlot = slots[Slots.indexOf(slot as slots_id)]

    // =========================
    // ABILITIES (simulation only)
    // =========================

    const persistantAbilities =
        state.persistantAbilities.filter(
            (a) =>
                a.bakuganKey === bakuganKey &&
                a.userId === userId &&
                !a.canceled
        )

    if (!updatedSlot) return

    if (persistantAbilities) {
        for (const ability of persistantAbilities) {
            const card = [...AbilityCardsList, ...ExclusiveAbilitiesList]
                .find((c) => c.key === ability.key)

            if (!card) continue

            const abilities = updatedSlot.activateAbilities ?? []
            const lastId = abilities.at(-1)?.id ?? 0

            const newAbility: activateAbilities = {
                bakuganKey,
                canceled: false,
                id: lastId + 1,
                key: ability.key,
                userId
            }

            updatedSlot.activateAbilities.push(newAbility)

            if (card.onUserSet) {
                state = card.onUserSet({
                    bakuganKey,
                    roomState: state,
                    userId,
                    slot: slot as slots_id
                }) ?? state
            }
        }
    }

    // =========================
    // GATE EFFECT (simulation)
    // =========================

    if (updatedSlot.portalCard) {
        const gateCard = GateCardsList.find(
            (card) => card.key === updatedSlot.portalCard?.key
        )

        if (gateCard?.onSetBakuganOnSlot) {
            state =
                gateCard.onSetBakuganOnSlot({
                    bakugan,
                    roomState: state,
                    slot: updatedSlot
                }) ?? state
        }
    }

    return state
}