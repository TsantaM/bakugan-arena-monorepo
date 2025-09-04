import { AbilityCardsList, attribut, BakuganList, ExclusiveAbilitiesList, GateCardsList } from "@bakugan-arena/game-data"
import { getDecksDataPrisma, getRoomPlayers } from "./get-room-data"

type slots_id = "slot-1" | "slot-2" | "slot-3" | "slot-4" | "slot-5" | "slot-6"

type portalSlotsType = {
    id: slots_id,
    can_set: boolean,
    portalCard: {
        key: string,
        userId: string
    } | null,
    bakugans: {
        key: string,
        userId: string,
        powerLevel: number,
        currentPower: number,
        attribut: attribut,
        image: string
    }[],
    state: {
        open: boolean,
        canceled: boolean
    }
}[]

export const createGameState = async ({ roomId }: { roomId: string }) => {
    const decksData = await getDecksDataPrisma({ roomId })
    const players = await getRoomPlayers({ roomId })

    if (decksData && players) {
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
                        elimined: false,
                        onDomain: false,
                        gateCard: null,
                    }

                    const excluAbilitiesState = bakuganAbilities.map((c) => ({
                        key: c.key,
                        name: c.name,
                        description: c.description,
                        usable: false,
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
                usable: false,
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

        const gameState = {
            turn: players["player1"].player1?.id,
            turnCount: 1
        }

        const protalSlots: portalSlotsType = [
            {
                id: "slot-1",
                can_set: false,
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-2",
                can_set: true,
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-3",
                can_set: false,
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-4",
                can_set: false,
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-5",
                can_set: false,
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-6",
                can_set: false,
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
        ];

        const turnState = {
            turn: players.player1.player1?.id ? players.player1.player1?.id : '',
            turnCount: 1,
            set_new_gate: true,
            set_new_bakugan: false,
            use_ability_card: false
        }

        return {
            roomId: roomId,
            turnState,
            decksState,
            protalSlots
        }

    }
}

export type createGameStateType = Exclude<Awaited<ReturnType<typeof createGameState>>, undefined>
