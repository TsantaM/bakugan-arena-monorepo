import {
    AbilityCardsList,
    ExclusiveAbilitiesList,
    type activateAbilities,
    type stateType,
    type useAbilityCardProps
} from "@bakugan-arena/game-data"

export const SimulateUseAbilityCard = ({
    roomState,
    abilityId,
    slot,
    userId,
    bakuganKey
}: useAbilityCardProps & { roomState: stateType }): stateType | undefined => {

    let state = structuredClone(roomState)

    const abilities = [...AbilityCardsList, ...ExclusiveAbilitiesList]
    const abilityToUse = abilities.find((a) => a.key === abilityId)

    const playerAbilities = state.players.find(
        (p) => p.userId === userId
    )?.usable_abilitys

    const slotObj = state.protalSlots.find((s) => s.id === slot)

    const abilityUser = slotObj?.bakugans.find(
        (b) => b.key === bakuganKey && b.userId === userId
    )

    if (
        !state ||
        !abilityToUse ||
        !playerAbilities ||
        playerAbilities <= 0 ||
        !abilityUser ||
        abilityUser.abilityBlock
    ) return

    if (!state.turnState.use_ability_card) return
    if (state.turnState.ability_card_block.blocked) return

    // =========================
    // APPLY ABILITY
    // =========================

    const abilityReturn = abilityToUse.onActivate({
        roomState: state,
        roomId: state.roomId,
        bakuganKey,
        slot,
        userId
    })

    // =========================
    // REGISTER SLOT ABILITY
    // =========================

    const slotRef = state.protalSlots.find((s) => s.id === slot)
    if (slotRef) {
        const abilitiesList = slotRef.activateAbilities ?? []
        const lastId = abilitiesList.at(-1)?.id ?? 0

        const newAbility: activateAbilities = {
            id: lastId + 1,
            bakuganKey,
            canceled: false,
            key: abilityId,
            userId
        }

        slotRef.activateAbilities = [
            ...abilitiesList,
            newAbility
        ]
    }

    // =========================
    // MARK CARD USED
    // =========================

    const deck = state.decksState.find((d) => d.userId === userId)

    const abilityCardUsed = deck?.abilities.find(
        (a) => a.key === abilityId && !a.used
    )

    const exclusiveCard = deck?.bakugans
        .find((b) => b.bakuganData.key === bakuganKey)
        ?.excluAbilitiesState.find((e) => e.key === abilityId && !e.used)

    if (exclusiveCard) exclusiveCard.used = true
    if (abilityCardUsed) abilityCardUsed.used = true

    // =========================
    // UPDATE PLAYER STATE
    // =========================

    state.players = state.players.map((p) =>
        p.userId === userId
            ? {
                ...p,
                usable_abilitys: p.usable_abilitys - 1
            }
            : p
    )

    // =========================
    // APPLY RESULT (NO SOCKET)
    // =========================

    if (abilityReturn && abilityReturn.type !== "CARD_FAILED") {

        // simulate additional request queue only
        state.AbilityAditionalRequest = [
            ...(state.AbilityAditionalRequest ?? []),
            {
                roomId: state.roomId,
                bakuganKey,
                slot,
                cardKey: abilityId,
                userId,
                data: abilityReturn
            }
        ]

        return state
    }

    // =========================
    // FAILURE CASE (SIMPLIFIED)
    // =========================

    if (abilityReturn?.type === "CARD_FAILED") {

        state.animations = [
            ...(state.animations ?? []),
            {
                type: "ABILITY_CARD_FAILED",
                resolve: false,
                message: [
                    {
                        text: abilityReturn.message,
                        turn: state.turnState.turnCount
                    }
                ]
            }
        ]

        return state
    }

    // =========================
    // DEFAULT
    // =========================

    return state
}