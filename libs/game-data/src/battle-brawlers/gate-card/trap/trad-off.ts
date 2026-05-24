import { GetUsableCardsInDeck } from "../../../function/filters/get-usable-cards-in-deck.js";
import { AdditionalEffectActiveCard, CancelGateCardAbilities, CheckBattle, CheckBattleStillInProcess, ComeBackBakuganEffect, ElimineBakuganEffect, gateCardAdditionalRequest, OpenGateCardActionRequest, portalSlotsTypeElement, RemoveGateCardDirectiveAnimation, ResetSlot, stateType, type gateCardType } from "../../../index.js";
import { GateCardImages } from "../../../store/gate-card-images.js";

function EchangeMainEffect({ roomState, slotOfGate, userId }: { roomState: stateType, slotOfGate: portalSlotsTypeElement, userId: string | undefined }) {
    const usersBakugan = slotOfGate.bakugans.filter((b) => b.userId === userId)
    const totalPowerUsersBakugans = usersBakugan.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)

    const opponentsBakugan = slotOfGate.bakugans.filter((b) => b.userId !== userId)
    const totalPowerOpponentsBakugans = opponentsBakugan.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)

    if (totalPowerUsersBakugans >= 400) {


        usersBakugan.forEach((b) => {
            ElimineBakuganEffect({
                bakugan: b,
                roomState: roomState,
                gateCardProtection: true
            })
        })

        // slotOfGate.bakugans = slotOfGate.bakugans.filter(
        //     (b) => !usersBakuganKeys.includes(b.key)
        // )
    } else {

        usersBakugan.forEach((b) => {
            ComeBackBakuganEffect({
                bakugan: b,
                roomState: roomState
            })
        })

    }

    if (totalPowerOpponentsBakugans >= 400) {

        opponentsBakugan.forEach((b) => {

            ElimineBakuganEffect({
                bakugan: b,
                roomState: roomState,
                gateCardProtection: true
            })
        })

        // slotOfGate.bakugans = slotOfGate.bakugans.filter(
        //     (b) => !opponentsBakuganKey.includes(b.key)
        // )
    } else {

        opponentsBakugan.forEach((b) => {
            ComeBackBakuganEffect({
                bakugan: b,
                roomState: roomState
            })
        })

    }

    RemoveGateCardDirectiveAnimation({
        animations: roomState.animations,
        slot: slotOfGate,
        roomState
    })

    ResetSlot(slotOfGate)
    CheckBattleStillInProcess(roomState)
    CheckBattle({ roomState })
    OpenGateCardActionRequest({ roomState })

    roomState.turnState.set_new_bakugan = true
    roomState.turnState.set_new_gate = true
}


export const Echange: gateCardType = {
    key: 'echange',
    name: 'Trade Off',
    maxInDeck: 1,
    description: `If a Bakugan has 400 G-Power or more, it automaticaly lose`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot, userId }) => {

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && roomState && slotOfGate.state.open === false && slotOfGate.state.canceled === false) {
            slotOfGate.state.open = true

            const request = GetUsableCardsInDeck({ cardsList: CancelGateCardAbilities, roomState, slotOfGate })

            if (request !== null && request.type === 'SELECT_ABILITY_CARD') {
                return request
            } else {
                EchangeMainEffect({ roomState, slotOfGate, userId })
            }
        }

        return null

    },
    onAdditionalRequest({ resolution, roomState }) {

        const { slot, userId } = resolution
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        const result: gateCardAdditionalRequest = {
            type: 'TURN_ACTION_LAUNCHER'
        }

        if (slotOfGate && roomState && slotOfGate.state.open === true && slotOfGate.state.canceled === false) {

            if (resolution.data.type !== 'SELECT_ABILITY_CARD') {
                EchangeMainEffect({ roomState, slotOfGate, userId })
                return result
            }

            const opponentsBakugan = slotOfGate.bakugans.find(
                (b) => b.userId !== slotOfGate.portalCard?.userId
            )

            if (!opponentsBakugan) {
                EchangeMainEffect({ roomState, slotOfGate, userId })
                return result
            }

            // LOGIQUE D'ACTIVATION
            AdditionalEffectActiveCard({opponentsBakugan, resolution, roomState})
            // LOGIQUE D'ACTIVATION END

            if (slotOfGate.state.canceled) {

                const ownerBakugans = slotOfGate.bakugans.filter(
                    (b) => b.userId === slotOfGate.portalCard?.userId
                )

                if (ownerBakugans.length === 0) {
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
                } else {
                    CheckBattle({
                        roomState
                    })
                }

            } else {

                EchangeMainEffect({ roomState, slotOfGate, userId })
                return result

            }

        }


        return result

    },
    autoActivationCheck({ portalSlot }) {
        if (!portalSlot?.bakugans || portalSlot.bakugans.length === 0) {
            return false
        }

        // Grouper les bakugans par userId
        const powerByUser: Record<string, number> = {}

        portalSlot.bakugans.forEach((b) => {
            if (!powerByUser[b.userId]) {
                powerByUser[b.userId] = 0
            }
            powerByUser[b.userId] += b.currentPower
        })

        // Vérifier si au moins un joueur atteint 400
        return Object.values(powerByUser).some(total => total >= 400)
    }
}