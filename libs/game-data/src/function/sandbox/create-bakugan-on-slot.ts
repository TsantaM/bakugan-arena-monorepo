import { Bakugans } from "../../battle-brawlers/bakugans.js"
import type { bakuganOnSlot, slots_id } from "../../type/room-types.js"

export type CreateBakuganOnSlotOptions = {
    key: string
    userId: string
    slotId: slots_id
    id: number
    currentPower?: number
    abilityBlock?: boolean
    assist?: bakuganOnSlot["assist"]
    statut?: Partial<bakuganOnSlot["statut"]>
}

const defaultStatut = (): bakuganOnSlot["statut"] => ({
    trapped: false,
    notRetreat: false,
    poisoned: false,
    protectedAgainstGate: false,
    protectedAgainstAbility: false,
    protected: false,
    absorbPowerBoost: false
})

export function createBakuganOnSlot({
    key,
    userId,
    slotId,
    id,
    currentPower,
    abilityBlock = false,
    assist = false,
    statut,
}: CreateBakuganOnSlotOptions): bakuganOnSlot | null {
    const catalog = Bakugans[key]
    if (!catalog) return null

    return {
        id,
        key: catalog.key,
        userId,
        slot_id: slotId,
        powerLevel: catalog.powerLevel,
        currentPower: currentPower ?? catalog.powerLevel,
        attribut: catalog.attribut,
        image: catalog.image,
        family: catalog.family,
        abilityBlock,
        assist,
        statut: {
            ...defaultStatut(),
            ...statut,
        },
    }
}
