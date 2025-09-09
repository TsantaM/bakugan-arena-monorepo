import { BakuganList } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export const SetBakuganOnGate = ({ roomId, bakuganKey, slot, userId }: { roomId: string, bakuganKey: string, slot: string, userId: string }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    const usable_slot = roomData?.protalSlots.find((s) => s.id === slot)?.portalCard != null
    const usable_slots = roomData?.protalSlots.filter((s) => s.portalCard != null)
    const can_set_bakugan = roomData?.turnState.set_new_bakugan
    const usable_bakugan = roomData?.decksState.find((d) => d.userId === userId)?.bakugans.filter((b) => b?.bakuganData.onDomain === false && b?.bakuganData.elimined === false).length ?? 3
    const usersBakuganOnGate = roomData?.protalSlots.find((s) => s.id === slot)?.bakugans.filter((b) => b.userId === userId).length ?? 0;

    if (usable_slot && can_set_bakugan && roomData.turnState.previous_turn != userId && usersBakuganOnGate < 1) {

        const slotToUpdate = roomData.protalSlots.find((s) => s.id === slot)
        const deckToUpdate = roomData.decksState.find((s) => s.userId === userId)
        const bakuganFromDeck = deckToUpdate?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.bakuganData

        const bakuganOpponent = slotToUpdate?.bakugans.some((b) => b.userId != userId)
        const bakuganUser = slotToUpdate?.bakugans.some((b) => b.userId === userId)
        const bakuganToAdd = BakuganList.find((b) => b.key === bakuganKey)
        const powerLevel = bakuganFromDeck?.currentPowerLevel

        if (slotToUpdate && bakuganToAdd && powerLevel && bakuganFromDeck.onDomain === false && bakuganFromDeck.elimined === false) {

            const newBakugan = {
                key: bakuganToAdd.key,
                userId: userId,
                powerLevel: bakuganToAdd.powerLevel,
                currentPower: powerLevel,
                attribut: bakuganToAdd.attribut,
                image: bakuganToAdd.image
            }

            if (usable_bakugan === 1 && usable_slots && usable_slots.length > 1) {
                if (bakuganOpponent && !bakuganUser) {
                    if (!slotToUpdate?.bakugans.includes(newBakugan)) {
                        const newDeckState: typeof bakuganFromDeck = {
                            ...bakuganFromDeck,
                            onDomain: true,
                        }

                        console.log(newDeckState)

                        const state: typeof roomData = {
                            ...roomData,
                            protalSlots: roomData.protalSlots.map((s) => s.id === slotToUpdate.id ? {
                                ...s,
                                bakugans: [...s.bakugans, newBakugan],
                            } : s),

                            decksState: roomData.decksState.map((d) => d.userId === userId ? {
                                ...d,
                                bakugans: d.bakugans.map((b) => b?.bakuganData.key === bakuganKey ? {
                                    ...b,
                                    bakuganData: {
                                        ...b.bakuganData,
                                        onDomain: true
                                    }
                                } : b)
                            } : d)
                        }

                        console.log(state)

                        if (roomIndex != -1) {
                            Battle_Brawlers_Game_State[roomIndex] = state

                        }

                    }
                } else {
                    return
                }
            } else {
                if (!slotToUpdate?.bakugans.includes(newBakugan)) {
                    const newDeckState: typeof bakuganFromDeck = {
                        ...bakuganFromDeck,
                        onDomain: true,
                    }

                    console.log(newDeckState)

                    const state: typeof roomData = {
                        ...roomData,
                        protalSlots: roomData.protalSlots.map((s) => s.id === slotToUpdate.id ? {
                            ...s,
                            bakugans: [...s.bakugans, newBakugan],
                        } : s),

                        decksState: roomData.decksState.map((d) => d.userId === userId ? {
                            ...d,
                            bakugans: d.bakugans.map((b) => b?.bakuganData.key === bakuganKey ? {
                                ...b,
                                bakuganData: {
                                    ...b.bakuganData,
                                    onDomain: true
                                }
                            } : b)
                        } : d)
                    }

                    console.log(state)

                    if (roomIndex != -1) {
                        Battle_Brawlers_Game_State[roomIndex] = state

                    }

                }
            }

        }



    }

}