import { AbilityCardsList, attribut, BakuganList, ExclusiveAbilitiesList, GateCardsList, portalSlotsType, stateType } from "@bakugan-arena/game-data"
import { getDecksDataPrisma, getRoomPlayers } from "./get-room-data"

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
                    }

                    const excluAbilitiesState = bakuganAbilities.map((c) => ({
                        key: c.key,
                        name: c.name,
                        description: c.description,
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
                usable_abilitys: 3
            },
            {
                userId: players.player2.player2.id,
                usable_gates: 3,
                usable_abilitys: 3
            }
        ]

        const turnState = {
            turn: players.player1.player1?.id ? players.player1.player1?.id : '',
            previous_turn: undefined,
            turnCount: 1,
            set_new_gate: true,
            set_new_bakugan: false,
            use_ability_card: false
        }

        const battleState = {
            battleInProcess: false,
            slot: null,
            turns: 2,
            paused: false
        }
        // Just for checking state type this const state will never be used

        const state: stateType = {
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
            }
        }

        return {
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
            }
        }

    }
}

export type createGameStateType = Exclude<Awaited<ReturnType<typeof createGameState>>, undefined>
