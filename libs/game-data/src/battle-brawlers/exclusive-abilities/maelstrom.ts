import { CustomAnimationDirective, PowerChange } from "../../function/index.js"
import { LegendarySoldiersImage } from "../../store/gate-card-images.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const Maelstrom: exclusiveAbilitiesType = {
    key: 'maelstrom',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    image: LegendarySoldiersImage.ventus,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null
        PowerChange({
            bakugan: user,
            G: 200,
            malus: false,
            roomState: roomState
        })

        if(!slotOfGate) return null

        const opponents = slotOfGate?.bakugans.filter((b) => b.userId !== userId)
        if(!opponents) return null

        if(opponents.length > 0) {
            CustomAnimationDirective({
                roomState,
                animationKey: Maelstrom.key,
                sourceBakugan: user,
                targetBakugans: opponents,
                slotId: slot,
            })
        }

        if(opponents.length > 2) {
            opponents[0].statut.toSave = {
                check: true,
                key: "maelstrom",
                origin: "ABILITY",
                ability: {
                    key: "maelstrom",
                    user: user
                }
            }
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null
        PowerChange({
            bakugan: user,
            G: 200,
            malus: true,
            roomState: roomState
        })

        const opponents = slotOfGate?.bakugans.filter((b) => b.userId !== userId)
        if(!opponents) return null
        const opponentToSave = opponents.find((b) => b.statut.toSave && b.statut.toSave.key === "maelstrom" && b.statut.toSave.ability?.user.key === user.key)
        if(!opponentToSave) return null
        opponentToSave.statut.toSave = false

    },
    canUse({ roomState, bakugan }) {
        const { battleInProcess, paused, slot } = roomState.battleState

        if (!battleInProcess || paused || slot === null) return false

        if (bakugan.slot_id !== slot) return false

        return true
    }
}