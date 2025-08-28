import { AbilityCardsList, attribut, BakuganList, ExclusiveAbilitiesList, GateCardsList } from "@bakugan-arena/game-data"
import { getDecksDataPrisma, getRoomPlayers } from "./get-room-data"

type slots_id = "slot-1" | "slot-2" | "slot-3" | "slot-4" | "slot-5" | "slot-6"

type portalSlotsType = {
    id: slots_id,
    portalCard: {
        key: string,
        userId: string
    } | null,
    bakugans: {
        key: string,
        userId: string,
        powerLevel: number,
        currentPower: number,
        attribut: attribut
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
                const exclusiveAbilityCard = ExclusiveAbilitiesList.filter((c) => deck.exclusiveAbilities.includes(c.key))
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

            const cardsInDeck = AbilityCardsList.filter((c) => deck.ability.includes(c.key))

            const abilities = cardsInDeck.map((c) => ({
                key: c.key,
                name: c.name,
                attribut: c.attribut,
                description: c.description,
                usable: false,
                used: false,
                dead: false
            }))

            const gateInDeck = GateCardsList.filter((c) => deck.gateCards.includes(c.key))

            const gates = gateInDeck.map((c) => ({
                key: c.key,
                name: c.name,
                attribut: c.attribut,
                description: c.description,
                set: false,
                usable: false,
                dead: false
            }))

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
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-2",
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-3",
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-4",
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-5",
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
            {
                id: "slot-6",
                portalCard: null,
                bakugans: [],
                state: {
                    open: false,
                    canceled: false
                }
            },
        ];

        return {
            roomId: roomId,
            decksState,
            protalSlots
        }

    }
}

export type createGameStateType = Exclude<Awaited<ReturnType<typeof createGameState>>, undefined>
