import { CustomAnimationDirective, PowerChange } from "../../function/index.js"
import { LegendarySoldiersImage } from "../../store/gate-card-images.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const MaximumPyrus: exclusiveAbilitiesType = {
    key: 'maximum-pyrus',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    image: LegendarySoldiersImage.pyrus,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null

        CustomAnimationDirective({
            roomState,
            animationKey: MaximumPyrus.key,
            sourceBakugan: user,
            targetBakugans: slotOfGate.bakugans.filter((b) => b.userId !== userId),
            slotId: slot,
        })

        PowerChange({
            bakugan: user,
            G: 200,
            malus: false,
            roomState: roomState
        })

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

    },
    canUse({ roomState, bakugan }) {
        const { battleInProcess, paused, slot } = roomState.battleState

        if (!battleInProcess || paused || slot === null) return false

        if (bakugan.slot_id !== slot) return false

        return true
    }
}