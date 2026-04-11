import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { activateAbilities } from "../../type/room-types.js"

export const RobotallionExecution: exclusiveAbilitiesType = {
    key: "robotalion-execution",
    name: 'Robotalion Enforcement',
    maxInDeck: 1,
    description: `Adds 50 Gs to the user`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
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
                    key: RobotallionExecution.key
                }

                roomState.persistantAbilities.push(activateAbility)
                console.log('after ability persistant', roomState.persistantAbilities)

                user.currentPower += 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: false,
                    turn: roomState.turnState.turnCount

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

        user.currentPower += 50
        PowerChangeDirectiveAnumation({
            animations: roomState?.animations,
            bakugans: [user],
            powerChange: 50,
            malus: false,
            turn: roomState.turnState.turnCount

        })

    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower -= 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: true,
                    turn: roomState.turnState.turnCount
                })
            }

        }
    },
}