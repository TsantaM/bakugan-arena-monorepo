import { type attribut, type bakuganType } from "../type/game-data-types"
import { type stateType, type slots_id, type bakuganOnSlot } from "../type/room-types"

type addBakuganToSlotParams = {
    roomData: stateType,
    slotId: slots_id,
    userId: string,
    bakuganFromDeck:
    {
        key: string,
        name: string,
        attribut: attribut,
        image: string,
        powerLevel: number,
        currentPowerLevel: number,
        activateAbilities: string[],
        persistantAbilities: string[],
        elimined: boolean,
        onDomain: boolean,
        gateCard: null
    }
    ,
    bakuganToAdd: bakuganType | bakuganOnSlot,
    assist?: boolean
}

export function addBakuganToSlot({ bakuganFromDeck, bakuganToAdd, roomData, slotId, userId, assist }: addBakuganToSlotParams) {
    if(!roomData) return
    if(!bakuganToAdd) return
    
    const slot = roomData.protalSlots.find((s) => s.id === slotId)

    const lastId = slot && slot?.bakugans.length > 0 ? slot.bakugans[slot.bakugans.length - 1].id : 0
    const newId = lastId + 1


    const newBakugan: bakuganOnSlot = {
        slot_id: slotId,
        id: newId,
        key: bakuganToAdd.key,
        userId: userId,
        powerLevel: bakuganToAdd.powerLevel,
        currentPower: bakuganFromDeck.currentPowerLevel,
        attribut: bakuganToAdd.attribut,
        image: bakuganToAdd.image,
        abilityBlock: false,
        assist: assist ? assist : false,
        family: bakuganToAdd.family,
    }

    const newState = {
        ...roomData,
        protalSlots: roomData.protalSlots.map(s =>
            s.id === slotId
                ? { ...s, bakugans: [...s.bakugans, newBakugan] }
                : s
        ),
        decksState: roomData.decksState.map(d =>
            d.userId === userId
                ? {
                    ...d,
                    bakugans: d.bakugans.map(b =>
                        b?.bakuganData.key === bakuganFromDeck.key
                            ? { ...b, bakuganData: { ...b.bakuganData, onDomain: true } }
                            : b
                    )
                }
                : d
        ),
    }
    console.log(newState)

    return newState
}
