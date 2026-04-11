import { AbilityCards, AbilityCardsList, BakuganList, Bakugans, ExclusiveAbilities, ExclusiveAbilitiesList, GateCards, GateCardsList, portalSlotsType, SelectableGateCardAction, stateType, turnStateType } from "@bakugan-arena/game-data"
import { getDecksData, getRoomPlayers } from "./get-room-data"

export const createGameState = async ({ roomId, ranked }: { roomId: string; ranked: boolean }) => {
    const decksData = await getDecksData({ roomId })
    const players = await getRoomPlayers({ roomId })

    if (!decksData) return
    if (!players) return
    const { player1, player2 } = players
    if (!player1) return
    if (!player2) return
    const decksState = decksData.map((deck) => {
        const bakugans = deck.bakugans.map((b) => {

            const bakugan = Bakugans[b]
            const exclusiveAbilityCard = deck.exclusiveAbilities
                .map((key) => ExclusiveAbilities[key])

            const bakuganAbilities = exclusiveAbilityCard.filter((e) => bakugan.exclusiveAbilities.includes(e.key))

            const bakuganData = {
                key: bakugan.key,
                name: bakugan.name,
                attribut: bakugan.attribut,
                image: bakugan.image,
                powerLevel: bakugan.powerLevel,
                currentPowerLevel: bakugan.powerLevel,
                activateAbilities: [],
                persistantAbilities: [],
                elimined: false,
                onDomain: false,
                gateCard: null,
                family: bakugan.family
            }

            const excluAbilitiesState = bakuganAbilities.map((c) => ({
                key: c.key,
                name: c.name,
                description: c.description,
                usable_if_user_not_on_domain: c.usable_if_user_not_on_domain,
                used: false,
                dead: false
            }))

            return {
                bakuganData,
                excluAbilitiesState,
            }
        })

        const cardsInDeck = deck.ability
            .map((key) => AbilityCards[key])

        const abilities = cardsInDeck.map((c) => ({
            key: c.key,
            name: c.name,
            attribut: c.attribut,
            description: c.description,
            used: false,
            dead: false
        }))


        const gateInDeck = deck.gateCards
            .map((key) => GateCards[key])
            .filter((c) => c !== undefined)

        const gates = [... new Set(gateInDeck.map((c) => ({
            key: c.key,
            name: c.name,
            attribut: c.attribut,
            description: c.description,
            set: false,
            usable: true,
            dead: false
        })))]

        return {
            deckId: deck.id,
            userId: deck.userId,
            bakugans,
            abilities,
            gates
        }
    })

    const protalSlots: portalSlotsType = [
        {
            id: "slot-1",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
                open: false,
                canceled: false,
                blocked: false
            }
        },
        {
            id: "slot-2",
            can_set: true,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
                open: false,
                canceled: false,
                blocked: false
            }
        },
        {
            id: "slot-3",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
                open: false,
                canceled: false,
                blocked: false
            }
        },
        {
            id: "slot-4",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
                open: false,
                canceled: false,
                blocked: false
            }
        },
        {
            id: "slot-5",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
                open: false,
                canceled: false,
                blocked: false
            }
        },
        {
            id: "slot-6",
            can_set: false,
            portalCard: null,
            activateAbilities: [],
            bakugans: [],
            state: {
                open: false,
                canceled: false,
                blocked: false
            }
        },
    ];

    const timer: number = 5 * 60

    const playersState = [
        {
            userId: player1.id,
            usable_gates: 3,
            usable_abilitys: 3,
            username: player1.displayUsername || '',
            timer: timer,
        },
        {
            userId: player2.id,
            usable_gates: 3,
            usable_abilitys: 3,
            username: player2.displayUsername || '',
            timer: timer,
        }
    ]

    const turnState: turnStateType = {
        turn: player1.id,
        previous_turn: player2.id,
        turnCount: 0,
        set_new_gate: true,
        set_new_bakugan: false,
        use_ability_card: false,
        can_change_player_turn: false,
        ability_card_block: {
            blocked: false,
            reason: null,
            turn: 0
        }
    }

    const battleState = {
        battleInProcess: false,
        slot: null,
        turns: 2,
        paused: false
    }
    // Just for checking state type this const state will never be used

    const p1Deck = decksData.find((deck) => deck.userId === player1.id)
    const p2Deck = decksData.find((deck) => deck.userId === player2.id)

    if (!p1Deck) return
    if (!p2Deck) return

    const p1Gates: SelectableGateCardAction[] = p1Deck.gateCards.map((card) => {
        const gate = GateCardsList.find((c) => c.key === card)
        if (gate) {
            return {
                key: gate.key,
                name: gate.name,
                description: gate.description,
                image: gate.image,
            }
        }
    }).filter((card) => card !== undefined)

    const p2Gates: SelectableGateCardAction[] = p2Deck.gateCards.map((card) => {
        const gate = GateCardsList.find((c) => c.key === card)
        if (gate) {
            return {
                key: gate.key,
                name: gate.name,
                description: gate.description,
                image: gate.image,
            }
        }
    }).filter((card) => card !== undefined)

    const state: stateType = {
        connectedsUsers: new Map(),
        messages: [],
        roomId: roomId,
        ranked: ranked,
        players: playersState,
        battleState,
        persistantAbilities: [],
        turnState,
        decksState,
        protalSlots,
        status: {
            finished: false,
            winner: null,
            elo: null
        },
        animations: [],
        ActivePlayerActionRequest: {
            target: 'ACTIVE_PLAYER',
            actions: {
                mustDo: [{
                    type: 'SELECT_GATE_CARD',
                    data: p1Gates
                }],
                mustDoOne: [],
                optional: []
            }
        },
        InactivePlayerActionRequest: {
            target: 'INACTIVE_PLAYER',
            actions: {
                mustDo: [{
                    type: 'SELECT_GATE_CARD',
                    data: p2Gates
                }],
                mustDoOne: [],
                optional: []
            }
        },
        AbilityAditionalRequest: []
    }

    return state


}

export type createGameStateType = Exclude<Awaited<ReturnType<typeof createGameState>>, undefined>
