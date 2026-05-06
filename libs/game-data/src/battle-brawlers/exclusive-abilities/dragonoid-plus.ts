import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { activateAbilities } from "../../type/room-types.js"

export const DragonoidPlus: exclusiveAbilitiesType = {
    key: 'dragonoid-plus',
    name: 'Boosted Dragon',
    description: `Adds 100 Gs to the user for the entire duration of the game, as long as the card is not canceled.`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    image: 'boosted-dragonoid.jpg',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {

                const abilities = roomState.persistantAbilities
                const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0
                const newId = lastId + 1

                const activateAbility: activateAbilities = {
                    bakuganKey: bakuganKey,
                    userId: userId,
                    canceled: false,
                    id: newId,
                    key: DragonoidPlus.key
                }

                roomState.persistantAbilities.push(activateAbility)

                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })

            }
        }

        return null
    },
    onUserSet({ roomState, bakuganKey, slot, userId }) {
        if (!roomState) return

        const slotOfUser = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfUser) return

        const user = slotOfUser.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return

        PowerChange({
            bakugan: user,
            G: 100,
            malus: false,
            roomState: roomState
        })

    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: true,
                    roomState: roomState
                })
            }

            const abilityIndex = roomState.persistantAbilities.findIndex((a) => a.key === DragonoidPlus.key && a.bakuganKey === bakuganKey && a.userId === userId && !a.canceled)
            if (abilityIndex !== -1) {
                roomState.persistantAbilities[abilityIndex].canceled = true
            }


        }
    },
    canUse({ roomState, bakugan }) {

        const { battleInProcess, paused, slot } = roomState.battleState

        if(!battleInProcess || paused || slot === null) return false

        if(bakugan.slot_id !== slot) return false

        return true
    },
}