import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const OmbreBleue: exclusiveAbilitiesType = {
    key: 'ombre-bleue',
    name: 'Blue Stealth',
    description: `Transfers 50 Gs from opponent Bakugan to the user and prevent the opponent from opening their Gate Card`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                user.currentPower += 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })
            }
            slotOfGate.state.blocked = {
                blocked: true,
                blockedWith: 'ABILITY',
                key: OmbreBleue.key
            }
        }
        return null
    }
}