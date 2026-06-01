import { CancelAbilityCardEffect, PowerChange } from "../../function/index.js";
import { Slots } from "../../store/slots.js";
import { AbilityCardsActions, bakuganToMoveType2 as bakuganToMoveType } from "../../type/actions-serveur-requests.js";
import { exclusiveAbilitiesType } from "../../type/game-data-types.js";
import { activateAbilities } from "../../type/room-types.js";

export const DualGazer: exclusiveAbilitiesType = {
    key: 'dual-gazer',
    name: 'Dual Gazer',
    description: `Adds 100 Gs to the user for the entire duration of the game, as long as the card is not canceled, decrease 100Gs to the opponent and decrease the selected bakugan's power by 100 Gs.`,
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {

                const abilities = roomState.persistantAbilities
                const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0
                const newId = lastId + 1

                const activateAbility: activateAbilities = {
                    bakuganKey: bakuganKey,
                    userId: userId,
                    canceled: false,
                    id: newId,
                    key: DualGazer.key
                }

                roomState.persistantAbilities.push(activateAbility)

                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })

                opponents.forEach((opponent) => {
                    PowerChange({
                        bakugan: opponent,
                        G: 100,
                        malus: true,
                        roomState: roomState
                    })
                })

                const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat().filter((bakugan) => !bakugan.statut.trapped && !bakugan.statut.protectedAgainstAbility && !bakugan.statut.protected)

                const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
                    key: bakugan.key,
                    userId: bakugan.userId,
                    slot: bakugan.slot_id
                })).filter((bakugan) => bakugan.userId !== userId)

                if (bakugans.length === 0) {
                    return null
                }

                const request: AbilityCardsActions = {
                    type: 'SELECT_BAKUGAN_ON_DOMAIN',
                    message: 'Dual Gazer : Select a Bakugan to target',
                    bakugans: bakugans
                }

                return request

            }
        }

        return null
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return
        const { bakugan, slot, userId } = resolution.data

        const slotTarget = roomData.protalSlots[Slots.indexOf(slot)]
        const target = slotTarget.bakugans.find((b) => b.key === bakugan && b.userId === userId)
        if (!target) return

        PowerChange({
            bakugan: target,
            G: 100,
            malus: true,
            roomState: roomData
        })


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

        const abilities = slotOfUser.activateAbilities
        const lastId = abilities.length > 0 ? abilities[abilities.length - 1].id : 0
        const newId = lastId + 1

        // FR: On prépare l’objet représentant la capacité activée
        // ENG: Create a new activation object for the ability
        const newAbilityToPush: activateAbilities = {
            id: newId, // FR: Toujours supérieur au précédent / ENG: Always greater than the last one
            bakuganKey: bakuganKey,
            canceled: false,
            key: DualGazer.key,
            userId: userId
        }
        slotOfUser.activateAbilities.push(newAbilityToPush)

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

            const abilityIndex = roomState.persistantAbilities.findIndex((a) => a.key === DualGazer.key && a.bakuganKey === bakuganKey && a.userId === userId && !a.canceled)
            if (abilityIndex !== -1) {
                roomState.persistantAbilities[abilityIndex].canceled = true

                if (roomState.persistantAbilities[abilityIndex].fusion) {
                    slotOfGate.activateAbilities.forEach((a) => {
                        if (a.userId === userId && a.bakuganKey === bakuganKey && !a.canceled && roomState.persistantAbilities[abilityIndex].fusion?.includes(a.key)) {
                            CancelAbilityCardEffect({
                                roomState: roomState,
                                slotOfGate: slotOfGate,
                                ability: a
                            })
                        }
                    })
                }


            }


        }
    },
    canUse({ roomState, bakugan }) {

        const { battleInProcess, paused, slot } = roomState.battleState

        if (!battleInProcess || paused || slot === null) return false

        if (bakugan.slot_id !== slot) return false

        return true
    },
}