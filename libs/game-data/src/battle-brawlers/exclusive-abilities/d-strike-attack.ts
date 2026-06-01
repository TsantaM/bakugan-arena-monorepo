import { CancelAbilityCardEffect, PowerChange } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { activateAbilities } from "../../type/room-types.js"

export const DStrikeAttack: exclusiveAbilitiesType = {
    key: 'd-strike-attack',
    name: 'D Strike Attack',
    description: `Adds 200 Gs to the user for the entire duration of the game, as long as the card is not canceled.`,
    maxInDeck: 1,
    usable_in_neutral: false,
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
                    key: DStrikeAttack.key
                }

                roomState.persistantAbilities.push(activateAbility)

                PowerChange({
                    bakugan: user,
                    G: 200,
                    malus: false,
                    roomState: roomState
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

        PowerChange({
            bakugan: user,
            G: 200,
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
            key: DStrikeAttack.key,
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
                    G: 200,
                    malus: true,
                    roomState: roomState
                })
            }

            const abilityIndex = roomState.persistantAbilities.findIndex((a) => a.key === DStrikeAttack.key && a.bakuganKey === bakuganKey && a.userId === userId && !a.canceled)
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