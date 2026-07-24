import {
    AbilityCardFailed,
    CheckBattle,
    CheckBattleStillInProcess,
    MoveToAnotherSlotDirectiveAnimation,
    PowerChange,
    isProtectedAgainstAbility,
} from "../../function/index.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { bakuganOnSlot } from "../../type/room-types.js"
import type { bakuganToMoveType2 as bakuganToMoveType } from "../../type/type-index.js"
import { Bakugans } from "../bakugans.js"

export const SouffleInfini: exclusiveAbilitiesType = {
    key: 'souffle-infini',
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const animation = AbilityCardFailed({ abilityKey: SouffleInfini.key })

        if (!roomState) return animation

        if (SouffleInfini.activationConditions) {
            const checker = SouffleInfini.activationConditions({ roomState, userId })
            if (checker === false) return animation
        }

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        const deck = roomState.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return animation

        const targets = roomState.protalSlots
            .filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0)
            .map((s) => s.bakugans)
            .flat()
            .filter((bakugan) => !bakugan.statut.trapped && !isProtectedAgainstAbility(bakugan))

        const bakugans: bakuganToMoveType[] = targets.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_drag', params: { abilityKey: SouffleInfini.key } },
            bakugans: bakugans
        }

        return request
    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag = resolution.data.slot
        const target = resolution.data.bakugan
        const targetUserId = resolution.data.userId
        const slotTarget = roomState.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState.protalSlots.find((s) => s.id === resolution.slot)

        if (!slotOfGate || !slotTarget || !target) return

        const bakuganIndex = slotTarget.bakugans.findIndex(
            (b) => b.key === target && b.userId === targetUserId
        )
        const bakuganToDrag = slotTarget.bakugans.find(
            (b) => b.key === target && b.userId === targetUserId
        )
        const user = slotOfGate.bakugans.find(
            (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId
        )

        if (!user || !bakuganToDrag || bakuganIndex < 0) return

        if (isProtectedAgainstAbility(bakuganToDrag)) {
            NewAdditionnalMessage({
                roomState,
                key: 'bakugan_protected',
                params: { name: Bakugans[bakuganToDrag.key].name },
            })
            return
        }

        PowerChange({
            roomState,
            bakugan: bakuganToDrag,
            G: 50,
            malus: true,
            origin: 'ABILITY',
        })

        const newState: bakuganOnSlot = {
            ...bakuganToDrag,
            slot_id: slotOfGate.id
        }

        slotOfGate.bakugans.push(newState)
        slotTarget.bakugans.splice(bakuganIndex, 1)
        MoveToAnotherSlotDirectiveAnimation({
            animations: roomState.animations,
            bakugan: bakuganToDrag,
            initialSlot: slotTarget,
            newSlot: slotOfGate,
            turn: roomState.turnState.turnCount,
            roomState: roomState
        })
        CheckBattle({ roomState })
        CheckBattleStillInProcess(roomState)
    },
    activationConditions: ({ roomState }) => {
        if (!roomState) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().length
        if (bakugans < 2) return false
        return true
    },
    canUse({ bakugan, roomState }) {
        if (!roomState) return false
        const bakugansOnOtherSlots = roomState.protalSlots
            .filter((slot) => slot.id !== bakugan.slot_id)
            .map((slot) => slot.bakugans)
            .flat()
            .filter((b) => !b.statut.trapped && !isProtectedAgainstAbility(b))
            .length
        if (bakugansOnOtherSlots < 1) return false

        return true
    }
}
