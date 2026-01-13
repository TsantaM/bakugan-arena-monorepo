import { OpenGateCardActionRequest } from "../../function/action-request-functions/open-gate-card-action-request"
import { CancelAbilityCard } from "../../function/cancel-ability-card"
import { CheckBattle } from "../../function/check-battle-in-process"
import { CheckBattleStillInProcess } from "../../function/check-battle-still-in-process"
import { SetBakuganAndAddRenfortAnimationDirective } from "../../function/create-animation-directives/add-renfort-directive"
import { CancelGateCardDirectiveAnimation } from "../../function/create-animation-directives/cancel-gate-card"
import { MoveToAnotherSlotDirectiveAnimation } from "../../function/create-animation-directives/move-to-another-slot"
import { PowerChangeDirectiveAnumation } from "../../function/create-animation-directives/power-change"
// import { SetBakuganDirectiveAnimation } from "../../function/create-animation-directives/set-bakugan-animation-directives"
import type { AbilityCardsActions, bakuganToMoveType } from "../../type/actions-serveur-requests"
import { type exclusiveAbilitiesType } from "../../type/game-data-types"
import type { slots_id, bakuganOnSlot } from "../../type/room-types"
import { GateCardsList } from "../gate-gards"

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
                    malus: false
                })
            }
            slotOfGate.state.blocked = true
        }
        return null
    }
}

export const ChambreDeGravite: exclusiveAbilitiesType = {
    key: 'chambre-de-gravité',
    name: 'Gravity Chamber',
    description: `Move an opponent on the battlefield to the user's Gate Card`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const DragonoidPlus: exclusiveAbilitiesType = {
    key: 'dragonoid-plus',
    name: 'Boosted Dragon',
    description: `Adds 100 Gs to the user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    image: 'boosted-dragonoid.jpg',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const ImpactMajeur: exclusiveAbilitiesType = {
    key: 'impact-majeur',
    name: 'Mega Impact',
    description: `Adds 50 Gs to the user.`,
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
                    malus: false
                })
            }
        }
        return null
    }
}

export const SabreDeLaMort: exclusiveAbilitiesType = {
    key: 'sabre-de-la-mort',
    name: 'Cut in Saber',
    description: `Adds Tigrerra into a battle`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: true,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            const deck = roomState?.decksState.find((d) => d.userId === userId)?.bakugans

            if (user && deck && slotOfGate) {
                const tigrerra = deck.find((b) => b?.bakuganData.key === 'tigrerra-haos' && !b.bakuganData.elimined && !b.bakuganData.onDomain)
                const ability = tigrerra?.excluAbilitiesState.find((a) => a.key === 'sabre-de-la-mort')
                if (tigrerra && ability) {
                    const lastId = slotOfGate.bakugans.length > 0 ? slotOfGate.bakugans[slotOfGate.bakugans.length - 1].id : 0
                    const newId = lastId + 1

                    const usersBakugan: bakuganOnSlot = {
                        slot_id: slot,
                        id: newId,
                        key: tigrerra.bakuganData.key,
                        userId: userId,
                        powerLevel: tigrerra.bakuganData.powerLevel,
                        currentPower: tigrerra.bakuganData.powerLevel,
                        attribut: tigrerra.bakuganData.attribut,
                        image: tigrerra.bakuganData.image,
                        abilityBlock: false,
                        assist: false,
                        family: tigrerra.bakuganData.family
                    }

                    slotOfGate.bakugans.push(usersBakugan)
                    tigrerra.bakuganData.onDomain = true
                    ability.used = true

                    SetBakuganAndAddRenfortAnimationDirective({
                        animations: roomState.animations,
                        bakugan: usersBakugan,
                        slot: structuredClone(slotOfGate)
                    })
                }
            }
        }
        return null
    }
}

export const VentViolentDeNobelesseVerte: exclusiveAbilitiesType = {
    key: 'vent-violent-de-noblesse-verte',
    name: 'Green Nobility - Soar Violent Winds',
    description: `Adds 100 Gs to the user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const AntiMuse: exclusiveAbilitiesType = {
    key: 'anti-muse',
    name: 'Anthemusa',
    description: `Bring an opponent to Sirenoid Gate Card`,
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    slotLimits: true,
    usable_if_user_not_on_domain: false,
    image: 'Anthemusa.png',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat()
        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: 'Anthemusa : Select a Bakugan to drag',
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag: slots_id = resolution.data.slot
        const target: string = resolution.data.bakugan
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot);

        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)

            const user = slotOfGate?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

            if (user && bakuganToDrag) {

                const newState: bakuganOnSlot = {
                    ...bakuganToDrag,
                    slot_id: slotOfGate.id
                }

                slotOfGate.bakugans.push(newState)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)
                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: bakuganToDrag,
                    initialSlot: slotTarget,
                    newSlot: slotOfGate
                })
                CheckBattleStillInProcess(roomState)

            }
        }
    }

}

export const VentCinglant: exclusiveAbilitiesType = {
    key: 'vent-cinglant',
    name: 'Forcing Wave',
    description: `Adds 100 Gs to the user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const AileEnflamee: exclusiveAbilitiesType = {
    key: 'aile-enflammee',
    name: 'Wing Burst',
    description: `Transfers 50 Gs from the opponent to user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== user?.userId)
            if (user && opponents) {
                user.currentPower += 50
                opponents.forEach((b) => b.currentPower -= 50)
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: false
                })
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: opponents,
                    powerChange: 50,
                    malus: true
                })
            }
        }

        return null
    }
}

export const VisageDuChagrin: exclusiveAbilitiesType = {
    key: 'visage-du-chagrin',
    name: 'Face of Grief',
    description: `Prevents the opponent from activationg abilities`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (user) {
                opponents.forEach(opponent => {
                    opponent.abilityBlock = true
                })
            }
        }
        return null
    },
    onWin: ({ roomState, userId }) => {
        const deckToUpdate = roomState?.decksState.find((d) => d.userId === userId)
        if (deckToUpdate) {
            deckToUpdate.bakugans.filter((b) => b && b.bakuganData.elimined === true).forEach((b) => {
                b?.bakuganData.elimined ? b.bakuganData.elimined = false : b?.bakuganData.elimined
            })
        }
    },
}

export const VisageDeLaFureur: exclusiveAbilitiesType = {
    key: 'visage-de-la-fureur',
    name: 'Face of Rage',
    description: `Transfers 100 Gs from the opponent to user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
                opponents.forEach((opponent) => {
                    opponent.currentPower -= 100
                })
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: opponents,
                    powerChange: 100,
                    malus: true
                })
            }
        }

        return null
    }
}

export const VisageDeJoie: exclusiveAbilitiesType = {
    key: 'visage-de-joie',
    name: 'Face of Joy',
    description: `Nullifies opponent's gate card if it's open and prevent it to open if it doesn't`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        const gate = GateCardsList.find((g) => g.key === slotOfGate?.portalCard?.key)

        if (slotOfGate && gate) {
            if (slotOfGate.state.open) {
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate
                })

                if (gate.onCanceled) {
                    gate.onCanceled({ roomState, slot, userId, bakuganKey })
                }
                slotOfGate.state.canceled = true
            } else {
                slotOfGate.state.blocked = true
            }
        }

        return null
    },
    onWin: ({ roomState, userId }) => {
        const deckToUpdate = roomState?.decksState.find((d) => d.userId === userId)
        const player = roomState?.players.find((p) => p.userId === userId)
        if (deckToUpdate) {
            deckToUpdate.abilities.filter((a) => a.used === true).forEach((a) => {
                a.used = false
            })
            deckToUpdate.bakugans.forEach((b) => {
                const abilities = b?.excluAbilitiesState.filter((a) => a.used === true)
                if (abilities) {
                    abilities.forEach((a) => {
                        a.used = false
                    })
                }
            })
        }
        if (player) {
            player.usable_abilitys = 3
        }
    },
}

export const GaucheGigantesque: exclusiveAbilitiesType = {
    key: 'gauche-gigantesque',
    name: 'Left Giganti',
    description: `Nullifies opponent's Gate Card`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                if (slotOfGate.state.open && !slotOfGate.state.canceled) {
                    slotOfGate.state.canceled = true
                    CancelGateCardDirectiveAnimation({
                        animations: roomState?.animations,
                        slot: structuredClone(slotOfGate)
                    })

                    const gate = GateCardsList.find((gate) => gate.key === slotOfGate.portalCard?.key)
                    if (gate && gate.onCanceled) {
                        gate.onCanceled({
                            roomState: roomState,
                            slot: slotOfGate.id,
                            userId: userId,
                        })
                    }
                }
            }
        }

        return null
    }
}

export const MassueGigantesque: exclusiveAbilitiesType = {
    key: 'massue-gigantesque',
    name: 'Right Giganti',
    description: `Adds 100 Gs to the user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const TempeteDePlume: exclusiveAbilitiesType = {
    key: 'tempête-de-plume',
    name: 'Feather Storm',
    description: `Adds 100 Gs to the user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }
        return null
    }
}

export const RayonGamma: exclusiveAbilitiesType = {
    key: 'rayon-gamma',
    name: 'Rayon Gamma',
    description: `Annule toutes les capacité de l'adversaire et ajoute 50G à l'utilisateur`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilities = slotOfGate.activateAbilities.filter((a) => a.userId !== userId)
            if (user) {
                abilities.forEach((a) => {
                    CancelAbilityCard({ abilityKey: a.key, bakuganKey: a.bakuganKey, roomState: roomState, slot: slot, userId: userId })
                })
            }
        }

        return null
    }
}

export const DimmensionQuatre: exclusiveAbilitiesType = {
    key: 'dimmension-quatre',
    name: 'Dimmension Quatre',
    description: `Annule toutes les carte maitrises de l'adversaire`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilities = slotOfGate.activateAbilities.filter((a) => a.userId !== userId)
            if (user) {
                abilities.forEach((a) => {
                    CancelAbilityCard({ abilityKey: a.key, bakuganKey: a.bakuganKey, roomState: roomState, slot: slot, userId: userId })
                })
            }
        }

        return null
    }
}

export const Marionnette: exclusiveAbilitiesType = {
    key: 'marionnette',
    name: 'Marionnette',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    description: "Mantris can move any Bakugan to any Gate Card that it's owner chose",
    extraInputs: ['move-bakugan'],

    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null
        if (!slotOfGate) return null
        if (!userData) return null

        const bakugansOnField = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.key !== userData.key && bakugan.userId !== userData.userId)

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)
        const bakugans: bakuganToMoveType[] = bakugansOnField.map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: slotOfGate.id
        }))

        if (slots.length <= 0) return null

        const request: AbilityCardsActions = {
            type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
            message: 'Marionnette : Select a Bakugan to move and his destination',
            bakugans: bakugans,
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {

        if (resolution.data.type !== 'MOVE_BAKUGAN_TO_ANOTHER_SLOT') return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot)
        const { data } = resolution

        if (slotOfGate && roomState) {
            const bakugans = roomState.protalSlots.map((b) => b.bakugans).flat()
            const opponent = bakugans.find((b) => b.userId === data.bakugan.userId && b.key === data.bakugan.key)
            const initialSlot = roomState.protalSlots.find((slot) => slot.id === opponent?.slot_id)
            const index = initialSlot?.bakugans.findIndex((ba) => ba.key === opponent?.key && ba.userId === opponent.userId)
            const slotTarget = roomState?.protalSlots.find((s) => s.id === data.slot)

            if (opponent && slotTarget && slotTarget.portalCard !== null && index !== undefined && index >= 0 && initialSlot) {

                const newOpponentState: bakuganOnSlot = {
                    ...opponent,
                    slot_id: data.slot
                }

                slotTarget.bakugans.push(newOpponentState)
                initialSlot.bakugans.splice(index, 1)

                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: opponent,
                    initialSlot: structuredClone(initialSlot),
                    newSlot: structuredClone(slotTarget)
                })

                CheckBattleStillInProcess(roomState)
                CheckBattle({ roomState: roomState })
                OpenGateCardActionRequest({ roomState })

                return {
                    turnActionLaucher: true
                }

            }
        }
    }

}

export const LanceEclair: exclusiveAbilitiesType = {
    key: 'lance-eclair',
    name: 'Sling Blazer',
    description: `Enable Mantris to move any bakugan to any adjacent Gate Card that its owner chooses`,
    maxInDeck: 1,
    extraInputs: ["move-opponent"],
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null
        if (!slotOfGate) return null

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot).map((slot) => slot.id)
        const bakugans: bakuganToMoveType[] = slotOfGate.bakugans.filter((b) => b.userId !== userId).map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: slotOfGate.id
        }))

        if (slots.length <= 0) return null

        const request: AbilityCardsActions = {
            type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
            message: 'Sling Blazer : Select a Bakugan to move and his destination',
            bakugans: bakugans,
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {

        if (resolution.data.type !== 'MOVE_BAKUGAN_TO_ANOTHER_SLOT') return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot)
        const { data, userId } = resolution

        if (slotOfGate && roomState) {
            const user = slotOfGate.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === opponent?.key && ba.userId === opponent.userId)
            const slotTarget = roomState?.protalSlots.find((s) => s.id === data.slot)
            if (user && opponent && slotTarget && slotTarget.portalCard !== null) {

                const newOpponentState: bakuganOnSlot = {
                    ...opponent,
                    slot_id: data.slot
                }

                slotTarget.bakugans.push(newOpponentState)
                slotOfGate.bakugans.splice(index, 1)

                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: opponent,
                    initialSlot: structuredClone(slotTarget),
                    newSlot: structuredClone(slotTarget)
                })

                CheckBattleStillInProcess(roomState)
                OpenGateCardActionRequest({ roomState })

                return {
                    turnActionLaucher: true
                }
            }
        }
    }
}

export const MachettesJumelles: exclusiveAbilitiesType = {
    key: 'machettes-jumelles',
    name: 'Twin Machete',
    maxInDeck: 1,
    description: `Adds 100 Gs to Mantris`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilityToCancel = slotOfGate.activateAbilities.find((a) => a.key === 'machettes-jumelles')
            if (user && abilityToCancel) {
                user.currentPower -= 100
                abilityToCancel.canceled = true
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: true
                })
            }
        }
    },
}

export const RobotallionExecution: exclusiveAbilitiesType = {
    key: "robotalion-execution",
    name: 'Robotalion Enforcement',
    maxInDeck: 1,
    description: `Adds 50 Gs to the user`,
    usable_in_neutral: true,
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
                    malus: false
                })
            }
        }

        return null
    }
}

export const PlexusSolaire: exclusiveAbilitiesType = {
    key: 'plexus-solaire',
    name: 'Solar Plexus',
    maxInDeck: 1,
    description: `Nullifies opponents Gate Card and substract 50 Gs to opponent`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const gate = GateCardsList.find((g) => g.key === slotOfGate.portalCard?.key)

            if (user && opponent) {
                opponent.currentPower -= 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [opponent],
                    powerChange: 50,
                    malus: true
                })
                if (gate && gate.onCanceled && slotOfGate.state.open && !slotOfGate.state.canceled) {
                    CancelGateCardDirectiveAnimation({
                        animations: roomState.animations,
                        slot: structuredClone(slotOfGate)
                    })
                    gate.onCanceled({ roomState: roomState, slot: slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }
            }


        }

        return null
    }
}

export const EffecteurdOmbre: exclusiveAbilitiesType = {
    key: `effaceur-d'ombre`,
    description: `Substract 50 Gs to the opponent and nullifies his Gate Card`,
    name: `Shadow Scratch`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const gateCard = GateCardsList.find((card) => card.key === slotOfGate.portalCard?.key)
            if (slotOfGate.state.open && !slotOfGate.state.canceled && gateCard && gateCard.onCanceled) {
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: structuredClone(slotOfGate)
                })
                gateCard.onCanceled({ roomState: roomState, slot: slot, userId: userId, bakuganKey: bakuganKey })
            }
            slotOfGate.state.canceled = true

            if (user && opponent) {
                opponent.currentPower -= 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [opponent],
                    powerChange: 50,
                    malus: true
                })
            }
        }

        return null
    }
}

export const LanceDeFeu: exclusiveAbilitiesType = {
    key: 'lance-de-feu',
    name: 'Fire Sword',
    maxInDeck: 1,
    description: `Adds 100 Gs to the user`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const JavelotAquos: exclusiveAbilitiesType = {
    key: 'javelot-aquos',
    name: 'Aquos Javelin',
    maxInDeck: 1,
    description: `Switches Gate Card with the one next to it`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const Tsunami: exclusiveAbilitiesType = {
    key: 'tsunami',
    name: 'Tsunami Wave',
    maxInDeck: 1,
    description: `If you have three Aquos Bakugan on the field, with on of them being Siege, every Bakugan on the field (including yours) besides Siege autoatically loses`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    image: 'tsunami.jpg',
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const TrappeDeSable: exclusiveAbilitiesType = {
    key: 'trappe-de-sable',
    name: 'Sand Trap',
    description: `Permet d'attaquer un Bakugan se trouvant sur une autre carte portail et baise le niveau de puissance de la cible de 50 G`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat()
        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: 'Sand Trap : Select a Bakugan to drag',
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag: slots_id = resolution.data.slot
        const target: string = resolution.data.bakugan
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot);

        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)
            const condition = slotOfGate && slotTarget && bakuganToDrag && BakuganTargetIndex ? true : false

            const user = slotOfGate?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

            if (user && bakuganToDrag) {

                bakuganToDrag.currentPower = bakuganToDrag.currentPower - 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [bakuganToDrag],
                    powerChange: 50,
                    malus: true
                })

                const newState: bakuganOnSlot = {
                    ...bakuganToDrag,
                    slot_id: slotOfGate.id
                }

                slotOfGate.bakugans.push(newState)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)
                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: bakuganToDrag,
                    initialSlot: slotTarget,
                    newSlot: slotOfGate
                })
                CheckBattle({ roomState })
                CheckBattleStillInProcess(roomState)
            }
        }
    }
}

export const MaitreDesProfondeurs: exclusiveAbilitiesType = {
    key: 'maitre-des-profondeurs',
    name: 'Abyss Ruler',
    description: `Adds 100 Gs to the user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const DivisionHolographique: exclusiveAbilitiesType = {
    key: 'division-holographique',
    name: 'Division Holographique',
    maxInDeck: 1,
    description: `Permet à l'utilisateur de se protéger en absorbant la puissance des carte maîtrise utilisé contre lui`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const RegainSubit: exclusiveAbilitiesType = {
    key: 'regain-subit',
    name: 'Regain Subit',
    maxInDeck: 1,
    description: `Retire 100 G à tous les bakugans adverse et ajoute 100 G à l'utilisateur`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
                opponents.forEach((opponent) => {
                    opponent.currentPower -= 100
                })
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: opponents,
                    powerChange: 100,
                    malus: true
                })
            }
        }

        return null
    }
}

export const CapeDeFeu: exclusiveAbilitiesType = {
    key: 'cape de feu',
    name: 'Cape de Feu',
    maxInDeck: 1,
    description: `Ajoute 100 G en plus à l'utilisateur`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false
                })
            }
        }

        return null
    }
}

export const SouffleInfini: exclusiveAbilitiesType = {
    key: 'souffle-infini',
    name: 'Souffle Infini',
    maxInDeck: 1,
    description: `Attire un bakugan sur la même carte portail que l'utilisateur et retire 50G à la cible`,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat()
        const bakugans: bakuganToMoveType[] = slots.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: 'Souffre Infini : Choissez un Bakugan à attirer',
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag: slots_id = resolution.data.slot
        const target: string = resolution.data.bakugan
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot);

        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)

            const user = slotOfGate?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

            if (user && bakuganToDrag) {

                bakuganToDrag.currentPower = bakuganToDrag.currentPower - 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [bakuganToDrag],
                    powerChange: 50,
                    malus: true
                })

                const newState: bakuganOnSlot = {
                    ...bakuganToDrag,
                    slot_id: slotOfGate.id
                }

                slotOfGate.bakugans.push(newState)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)
                MoveToAnotherSlotDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: bakuganToDrag,
                    initialSlot: slotTarget,
                    newSlot: slotOfGate
                })
                CheckBattle({ roomState: roomState })
                CheckBattleStillInProcess(roomState)
            }
        }
    }
}