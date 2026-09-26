import RemoveRenfortAnimationDirective from "../../function/create-animation-directives/remove-renfort-animation-directive.js"
import { AddRenfortAnimationDirective, ComeBackBakuganDirectiveAnimation, CustomAnimationDirective } from "../../function/index.js"
import { canBeRevived } from "../../function/ability-cards-effects/revive-status.js"
import { LegendarySoldiersImage } from "../../store/gate-card-images.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { bakuganOnSlot } from "../../type/room-types.js"

export const SagittariusArrow: exclusiveAbilitiesType = {
    key: 'sagittarius-arrow',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    image: LegendarySoldiersImage.haos,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null
        const userDeck = roomState.decksState.find((d) => d.userId === user.userId)
        if (!userDeck) return null

        const haosBakugans = userDeck.bakugans.filter((b) => b.bakuganData.attribut === "Haos" && b.bakuganData.key !== user.key && b.bakuganData.elimined && canBeRevived(b))

        if (haosBakugans.length === 0) return null

        const renforts: bakuganOnSlot[] = []

        haosBakugans.forEach((bakugan) => {
            const lastId = slotOfGate.bakugans.length > 0 ? slotOfGate.bakugans[slotOfGate.bakugans.length - 1].id : 0
            const newId = lastId + 1

            const newBakugan: bakuganOnSlot = {
                slot_id: slot,
                id: newId,
                key: bakugan.bakuganData.key,
                userId: userId,
                powerLevel: bakugan.bakuganData.powerLevel,
                currentPower: bakugan.bakuganData.powerLevel,
                attribut: bakugan.bakuganData.attribut,
                image: bakugan.bakuganData.image,
                abilityBlock: false,
                assist: {
                    assist: true,
                    addedWith: 'ABILITY',
                    key: SagittariusArrow.key
                },
                statut: {
                    trapped: false,
                    notRetreat: false,
                    poisoned: false,
                    protectedAgainstGate: false,
                    protectedAgainstAbility: false,
                    protected: false,
                    absorbPowerBoost: false,
                    toSave: false,
                    lifeLess: false,
                    reanimated: {
                        check: true,
                        origin: 'ABILITY',
                        key: SagittariusArrow.key
                    }
                },
                family: bakugan.bakuganData.family
            }

            slotOfGate.bakugans.push(newBakugan)
            bakugan.bakuganData.elimined = false
            bakugan.bakuganData.onDomain = true
            renforts.push(newBakugan)
        })

        if (renforts.length === 0) return null

        CustomAnimationDirective({
            roomState,
            animationKey: SagittariusArrow.key,
            sourceBakugan: user,
            targetBakugans: renforts,
            slotId: slot,
            payload: {
                slot: structuredClone(slotOfGate),
            },
        })

        renforts.forEach((renfort) => {
            AddRenfortAnimationDirective({
                animations: roomState.animations,
                roomState,
                bakugan: renfort,
                slot: slotOfGate,
                turn: roomState.turnState.turnCount,
            })
        })

        return null
    },
    onCanceled({ roomState, userId, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const userDeck = roomState.decksState.find((d) => d.userId === userId)
        if (!userDeck) return null

        const renforts = slotOfGate.bakugans.filter((b) => b.userId === userId && b.assist && b.assist.addedWith === 'ABILITY' && b.assist.key === SagittariusArrow.key)

        renforts.forEach((renfort) => {
            const index = slotOfGate.bakugans.findIndex((b) => b.id === renfort.id && b.key === renfort.key && b.userId === renfort.userId)
            if (index === -1) return
            slotOfGate.bakugans.splice(index, 1)

            ComeBackBakuganDirectiveAnimation({
                animations: roomState.animations,
                bakugan: renfort,
                slot: slotOfGate,
                roomState: roomState
            })

            RemoveRenfortAnimationDirective({
                animations: roomState.animations,
                turnCount: roomState.turnState.turnCount,
                bakugan: renfort,
                roomState: roomState
            })

            const deckData = userDeck.bakugans.find((b) => b?.bakuganData.key === renfort.key)
            if (deckData) {
                deckData.bakuganData.onDomain = false
                deckData.bakuganData.elimined = true
            }
        })

        return null
    },
    canUse({ roomState, bakugan }) {
        const { battleInProcess, paused, slot } = roomState.battleState

        if (!battleInProcess || paused || slot === null) return false

        if (bakugan.slot_id !== slot) return false

        return true
    }
}
