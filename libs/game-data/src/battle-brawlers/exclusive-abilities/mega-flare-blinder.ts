import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { TentaclearHaos } from "../bakugans/tentacleer.js"

export const MegaFlareBlinder: exclusiveAbilitiesType = {
    key: 'mega-flare-blinder',
    name: 'Mega Flare Blinder',
    maxInDeck: 1,
    description: `Add 100 G to Tentaclear and prevent the opponent from opening the Gate Card on the same slot as the user.`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (bakuganKey !== TentaclearHaos.key) return null
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        // const opponent = slotOfGate.bakugans.filter((b) => b.userId !== userId)

        const { canceled, open } = slotOfGate.state

        if (!open && !canceled) {
            slotOfGate.state.blocked = {
                blocked: true,
                blockedWith: 'ABILITY',
                key: MegaFlareBlinder.key
            }

            NewAdditionnalMessage({
                roomState: roomState,
                text: 'Gate Card is blocked'
            })

        }

        // opponent.forEach((bakugan) => {
        //     bakugan.abilityBlock = true
        // })

        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        PowerChange({
            bakugan: user,
            G: 100,
            malus: false,
            roomState: roomState
        })

        return null
    },
    onCanceled({ roomState, userId, slot, bakuganKey }) {

        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const opponent = slotOfGate.bakugans.filter((b) => b.userId !== userId)

        const { blocked } = slotOfGate.state
        if (blocked) {
            slotOfGate.state.blocked = false
            NewAdditionnalMessage({
                roomState: roomState,
                text: `Card card is unblocked.`
            })
        }

        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        user.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [user],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay

        })

    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        if (bakugan.key !== TentaclearHaos.key) return false

        return true
    },
}