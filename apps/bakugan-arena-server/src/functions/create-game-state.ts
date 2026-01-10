import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, GateCardsList, portalSlotsType, stateType } from "@bakugan-arena/game-data"
import { getDecksDataPrisma, getRoomPlayers } from "./get-room-data"
import { turnStateType } from "@bakugan-arena/game-data/src/type/room-types"
import { SelectableGateCardAction } from "@bakugan-arena/game-data/src/type/actions-serveur-requests"

export const createGameState = async ({ roomId }: { roomId: string }) => {
    const decksData = await getDecksDataPrisma({ roomId })
    const players = await getRoomPlayers({ roomId })

    if (decksData && players && players.player1.player1 && players.player2.player2) {
        const decksState = decksData.map((deck) => {
            const bakugans = deck.bakugans.map((b) => {

                const bakugan = BakuganList.find((baku) => baku.key === b)
                const exclusiveAbilityCard = deck.exclusiveAbilities
                    .map((key) => ExclusiveAbilitiesList.find((c) => c.key === key))
                    .filter((c) => c !== undefined)

                const bakuganAbilities = exclusiveAbilityCard.filter((e) => bakugan?.exclusiveAbilities.includes(e.key))

                if (!b && !bakugan) return null

                if (bakugan != undefined && bakuganAbilities) {
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
                }
            })

            const cardsInDeck = deck.ability
                .map((key) => AbilityCardsList.find((c) => c.key === key))
                .filter((c) => c !== undefined)


            const abilities = cardsInDeck.map((c) => ({
                key: c.key,
                name: c.name,
                attribut: c.attribut,
                description: c.description,
                used: false,
                dead: false
            }))


            const gateInDeck = deck.gateCards
                .map((key) => GateCardsList.find((c) => c.key === key))
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

        const playersState = [
            {
                userId: players.player1.player1.id,
                usable_gates: 3,
                usable_abilitys: 3,
                username: players.player1.player1.displayUsername || ''
            },
            {
                userId: players.player2.player2.id,
                usable_gates: 3,
                usable_abilitys: 3,
                username: players.player2.player2.displayUsername || ''
            }
        ]

        const turnState: turnStateType = {
            turn: players.player1.player1?.id ? players.player1.player1?.id : '',
            previous_turn: players.player2.player2?.id ? players.player2.player2?.id : '',
            turnCount: 0,
            set_new_gate: true,
            set_new_bakugan: false,
            use_ability_card: false,
            can_change_player_turn: false
        }

        const battleState = {
            battleInProcess: false,
            slot: null,
            turns: 2,
            paused: false
        }
        // Just for checking state type this const state will never be used

        const p1Deck = decksData.find((deck) => deck.userId === players.player1.player1?.id)
        const p2Deck = decksData.find((deck) => deck.userId === players.player2.player2?.id)

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
            roomId: roomId,
            players: playersState,
            battleState,
            persistantAbilities: [],
            turnState,
            decksState,
            protalSlots,
            status: {
                finished: false,
                winner: null
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
}

export type createGameStateType = Exclude<Awaited<ReturnType<typeof createGameState>>, undefined>
