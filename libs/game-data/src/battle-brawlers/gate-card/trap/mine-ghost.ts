import { AbilityCardsList, AnimationDirectivesTypes, CancelGateCardAbilities, CheckBattle, CheckBattleStillInProcess, ElimineBakuganEffect, ExclusiveAbilitiesList, gateCardAdditionalRequest, GetUserName, portalSlotsTypeElement, RemoveGateCardDirectiveAnimation, ResetSlot, resolutionGateCardType, ResolveTrapCardAdditionalRequest, ResolveTrapCardOnOpen, Slots, stateType, type gateCardType } from "../../../index.js";
import { GateCardImages } from "../../../store/gate-card-images.js";

type MineGhostEffectParams = {
    roomState: stateType
    slotOfGate: portalSlotsTypeElement
    otherPlayerId: string
}

function MineGhostMainEffect({
    roomState,
    slotOfGate,
    otherPlayerId
}: MineGhostEffectParams): null | gateCardAdditionalRequest {

    slotOfGate.bakugans.forEach((bakugan) => {
        ElimineBakuganEffect({
            bakugan,
            roomState,
            gateCardProtection: true
        })
    })

    roomState.turnState.turn = slotOfGate.portalCard!.userId
    roomState.turnState.previous_turn = otherPlayerId

    RemoveGateCardDirectiveAnimation({
        animations: roomState.animations,
        slot: slotOfGate,
        roomState
    })

    ResetSlot(slotOfGate)

    roomState.turnState.set_new_bakugan = true
    roomState.turnState.set_new_gate = true

    CheckBattleStillInProcess(roomState)

    CheckBattle({
        roomState
    })

    return {
        type: 'TURN_ACTION_LAUNCHER'
    }
}

export const MineFantome: gateCardType = {
    key: 'mine-fantome',
    name: 'Mine Ghost',
    maxInDeck: 1,
    description: `When two ore Bakugan stand on the Card, no matter wich side they are on, they both lose`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot }) => {

        const slotOfGate = roomState?.protalSlots.find(
            (s) => s.id === slot
        )

        const otherPlayerId = roomState?.players.find(
            (p) => p.userId !== slotOfGate?.portalCard?.userId
        )?.userId

        if (
            !roomState ||
            !slotOfGate ||
            slotOfGate.portalCard === null ||
            slotOfGate.state.open === true ||
            slotOfGate.state.canceled === true ||
            !otherPlayerId
        ) {
            return null
        }

        slotOfGate.state.open = true

        return ResolveTrapCardOnOpen({
            roomState,
            slotOfGate,
            otherPlayerId,
            cardsList: CancelGateCardAbilities,
            onNoCard: () => {
                return MineGhostMainEffect({
                    roomState,
                    slotOfGate,
                    otherPlayerId
                })
            }
        })
    },
    onAdditionalRequest({ resolution, roomState }) {

        const slotOfGate =
            roomState?.protalSlots[
            Slots.indexOf(resolution.slot)
            ]

        const otherPlayerId = roomState?.players.find(
            (p) => p.userId !== slotOfGate?.portalCard?.userId
        )?.userId

        if (
            !roomState ||
            !slotOfGate ||
            slotOfGate.portalCard === null ||
            !otherPlayerId
        ) {
            return {
                type: 'TURN_ACTION_LAUNCHER'
            }
        }

        return ResolveTrapCardAdditionalRequest({
            resolution,
            roomState,
            slotOfGate,
            otherPlayerId,
            onMainEffect: () => {
                return MineGhostMainEffect({
                    roomState,
                    slotOfGate,
                    otherPlayerId
                })
            }
        })
    },
    autoActivationCheck: ({ portalSlot }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        if (bakugansOnSlot >= 2) {
            return true
        } else {
            return false
        }

    },
}