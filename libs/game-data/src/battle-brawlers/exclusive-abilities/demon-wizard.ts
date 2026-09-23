import { CancelGateCardDirectiveAnimation, CustomAnimationDirective, PowerChange } from "../../function/index.js"
import { LegendarySoldiersImage } from "../../store/gate-card-images.js"
import { Slots } from "../../store/slots.js"
import type { AbilityCardsActions, bakuganToMoveType2 } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { GateCardsList } from "../gate-gards.js"

export const DemonWizard: exclusiveAbilitiesType = {
    key: "demon-wizard",
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    image: LegendarySoldiersImage.darkus,
    canUse({ roomState, bakugan }) {

        const { battleInProcess, paused, slot } = roomState.battleState
        const slots = roomState.protalSlots

        const aliedOnField = slots.filter((s) => s.bakugans.some((b) => b.userId === bakugan.userId))
        const allies = aliedOnField.flatMap((s) => s.bakugans.filter((b) => b.userId === bakugan.userId && b.key !== bakugan.key && b.attribut === "Darkus"))

        if (!battleInProcess || paused || slot === null) return false

        if (bakugan.slot_id !== slot) return false

        if (allies.length === 0) return false

        return true
    },
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const { battleInProcess, paused } = roomState.battleState
        const slots = roomState.protalSlots
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null

        const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const aliedOnField = slots.filter((s) => s.bakugans.some((b) => b.userId === user.userId))
        const allies = aliedOnField.flatMap((s) => s.bakugans.filter((b) => b.userId === user.userId && b.key !== user.key && b.attribut === "Darkus"))

        if (!battleInProcess || paused || slot === null) return null

        if (user.slot_id !== slot) return null

        if (allies.length === 0) return null

        const bakugans: bakuganToMoveType2[] = allies.map((ally) => ({
            key: ally.key,
            userId: ally.userId,
            slot: ally.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_target', params: { abilityKey: DemonWizard.key } },
            bakugans: bakugans
        }

        return request
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (!roomData) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const { bakugan, slot: allySlotId, userId: allyUserId } = resolution.data

        const slotOfGate = roomData.protalSlots.find((s) => s.id === resolution.slot)
        if (!slotOfGate) return

        const user = slotOfGate.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)
        if (!user) return

        const allySlot = roomData.protalSlots[Slots.indexOf(allySlotId)]
        const ally = allySlot?.bakugans.find((b) => b.key === bakugan && b.userId === allyUserId)
        if (!ally) return
        if (ally.userId !== user.userId) return
        if (ally.key === user.key) return

        // Toute la puissance de l'allié passe à Exedra. L'allié reste sur le
        // terrain mais vidé : c'est le statut lifeLess qui le marque.
        const transferedPower = ally.currentPower

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: DemonWizard.key,
            sourceBakugan: user,
            targetBakugans: [ally],
            slotId: resolution.slot,
        })

        if (transferedPower > 0) {
            PowerChange({
                bakugan: ally,
                G: transferedPower,
                malus: true,
                roomState: roomData,
                ignoreProtection: true
            })

            PowerChange({
                bakugan: user,
                G: transferedPower,
                malus: false,
                roomState: roomData
            })
        }

        ally.statut.lifeLess = {
            check: true,
            origin: 'ABILITY',
            key: DemonWizard.key,
            ability: {
                key: DemonWizard.key,
                user: user
            }
        }

        // ... et la carte portail adverse est annulée.
        const gateCard = GateCardsList.find((card) => card.key === slotOfGate.portalCard?.key)
        const gateIsOpponents = slotOfGate.portalCard !== null && slotOfGate.portalCard.userId !== user.userId

        if (gateIsOpponents && slotOfGate.state.open && !slotOfGate.state.canceled) {
            // Coup de grâce : la carte portail adverse est détruite.
            CustomAnimationDirective({
                roomState: roomData,
                animationKey: 'coup-de-grace',
                sourceBakugan: user,
                slotId: slotOfGate.id,
            })

            CancelGateCardDirectiveAnimation({
                animations: roomData.animations,
                slot: structuredClone(slotOfGate),
                turn: roomData.turnState.turnCount,
                roomState: roomData
            })

            if (gateCard && gateCard.onCanceled) {
                gateCard.onCanceled({
                    roomState: roomData,
                    slot: slotOfGate.id,
                    userId: user.userId,
                    bakuganKey: user.key
                })
            }

            slotOfGate.state.canceled = true
        }
    }
}