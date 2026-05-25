import { ElimineBakuganEffect, RemoveGateCardDirectiveAnimation, ResetSlot } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { SiegeAquos } from "../bakugans/siege.js"

export const Tsunami: exclusiveAbilitiesType = {
    key: 'tsunami',
    name: 'Tsunami Wave',
    maxInDeck: 1,
    description: `When three allied Aquos Bakugan, including Aquos Siege, are present on the field, this card eliminates all Bakugan on the field except Aquos Siege. (Can't be used if a battle is in process or paused)`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    image: 'tsunami.jpg',
    onActivate: ({ roomState, userId, slot }) => {

        if (!roomState) return null
        if (!Tsunami.activationConditions) return null
        if (!Tsunami.canUse) return null

        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat()

        bakugans.forEach((bakugan) => {
            if (bakugan.key === SiegeAquos.key && bakugan.userId === userId) return
            ElimineBakuganEffect({
                bakugan: bakugan,
                roomState: roomState,
            })
        })

        const slots = roomState.protalSlots.filter((s) => s.id !== slot)

        slots.forEach((s) => {
            RemoveGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: s,
                roomState,
                    animationsForReplay: roomState.animationsForReplay

            })
            ResetSlot(s)
        })

        return null

    },
    activationConditions({ roomState, userId }) {
        if (!roomState) return false
        const {battleInProcess, paused} = roomState.battleState
        if(battleInProcess || paused) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat()
        const aquosBakugans = bakugans.filter((bakugan) => bakugan.attribut === "Aquos" && bakugan.userId === userId)
        const siege = aquosBakugans.find((bakugan) => bakugan.key === SiegeAquos.key)

        if (aquosBakugans.length < 3) return false
        if (!siege) return false

        return true
    },
    canUse({ bakugan }) {
        if (bakugan.key !== SiegeAquos.key) return false
        return true
    },
}