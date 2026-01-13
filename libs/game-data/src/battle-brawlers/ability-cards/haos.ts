import { SetBakuganAndAddRenfortAnimationDirective } from "../../function/create-animation-directives/add-renfort-directive";
import { ComeBackBakuganDirectiveAnimation } from "../../function/create-animation-directives/come-back-bakugan";
import { PowerChangeDirectiveAnumation } from "../../function/create-animation-directives/power-change";
import { StandardCardsImages } from "../../store/ability-cards-images";
import type { AbilityCardsActions } from "../../type/actions-serveur-requests";
import { type abilityCardsType } from "../../type/game-data-types";
import type { bakuganOnSlot } from "../../type/room-types";
import { AbilityCardsList } from "../ability-cards";
import { ExclusiveAbilitiesList } from "../exclusive-abilities";

export const RapideHaos: abilityCardsType = {
    key: 'rapide-haos',
    name: 'Rapide Haos',
    attribut: 'Haos',
    description: `Permet à l'utilisateur d'ajouter un bakugan en plus sur le terrain s'il y a déjà un bakugan Haos sur la carte`,
    maxInDeck: 1,
    usable_in_neutral: false,
    extraInputs: ['add-bakugan'],
    image: StandardCardsImages.haos,
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


export const EclatSoudain: abilityCardsType = {
    key: 'eclat-soudain',
    name: 'Rapid Haos',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `Adds another Bakugan to the Battle, it work only if there is minimum 2 haos bakugans on field`,
    usable_in_neutral: false,
    image: StandardCardsImages.haos,
    extraInputs: ['add-bakugan'],
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null
        if (!deck) return null
        const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Haos').map((b) => b.key)).flat()
        if (haosOnDomain.length < 2) return null
        const bakugans = deck.bakugans.filter((bakugan) => bakugan && bakugan.bakuganData.onDomain === false && bakugan.bakuganData.elimined === false).filter((bakugan) => bakugan !== undefined && bakugan !== null)
        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_TO_SET',
            message: 'Rapid Haos: Select a Bakugan to set ?',
            bakugans: bakugans
        }
        return request
    },

    onAdditionalEffect({ resolution, roomData: roomState }) {

        if (!roomState) return null
        if (resolution.data.type !== 'SELECT_BAKUGAN_TO_SET') return;

        const { bakuganKey, slot, userId } = resolution
        const data = resolution.data

        const bakugan = data.bakugan

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)

        if (slotOfGate && deck && bakugan) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === 'Haos').map((b) => b.key)).flat()

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
                assist: true,
                family: bakugan.bakuganData.family
            }

            if (user && haosOnDomain && haosOnDomain.length >= 2) {
                slotOfGate.bakugans.push(newBakugan)
                bakugan.bakuganData.onDomain = true
                SetBakuganAndAddRenfortAnimationDirective({
                    animations: roomState.animations,
                    bakugan: newBakugan,
                    slot: slotOfGate
                })
            }
        }
    },

    onCanceled({ roomState, userId, slot }) {
        if (!roomState) return
        const slotToUpdate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        if (slotToUpdate && deck) {
            const assistsBakugans = slotToUpdate.bakugans.filter((b) => b.userId === userId && b.assist)

            assistsBakugans.forEach((a) => {
                const index = slotToUpdate.bakugans.findIndex((b) => b.key === a.key && b.assist === a.assist && b.userId === a.userId)
                slotToUpdate.bakugans.splice(index, 1)

                ComeBackBakuganDirectiveAnimation({
                    animations: roomState?.animations,
                    bakugan: a,
                    slot: slotToUpdate
                })

                const deckDataToUpdate = deck.bakugans.find((b) => b?.bakuganData.key === a.key)
                if (deckDataToUpdate) {
                    deckDataToUpdate.bakuganData.onDomain = false
                }

            })

        }
    },
}


export const LumiereDivine: abilityCardsType = {
    key: 'lumiere-divine',
    name: 'Lumière Divine',
    maxInDeck: 1,
    attribut: 'Haos',
    description: `Permet de redonner vie à un Bakugan qui a été vaincu au combat`,
    image: StandardCardsImages.haos,
    usable_in_neutral: true,
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


export const ContreMaitrise: abilityCardsType = {
    key: 'contre-maîtrise',
    attribut: 'Haos',
    name: 'Ability Counter',
    description: `Nullifies the opponent's ability`,
    maxInDeck: 3,
    image: StandardCardsImages.haos,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            // const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const lastAbility = slotOfGate.activateAbilities.find((a) => a.userId !== userId)

            if (lastAbility && !lastAbility.canceled) {
                const ability = AbilityCardsList.find((a) => a.key === lastAbility.key)
                const exclusive = ExclusiveAbilitiesList.find((a) => a.key === lastAbility.key)

                if (ability && ability.onCanceled) ability.onCanceled({ roomState, bakuganKey: lastAbility.bakuganKey, slot: slot, userId: lastAbility.userId })
                if (exclusive && exclusive.onCanceled) exclusive.onCanceled({ roomState, bakuganKey: lastAbility.bakuganKey, slot: slot, userId: lastAbility.userId })

                lastAbility.canceled = true
            }
        }

        return null
    }
}


export const HaosImmobilisation: abilityCardsType = {
    key: 'haos-immobilisation',
    name: 'Haos Stasis',
    attribut: 'Haos',
    maxInDeck: 1,
    description: `If two Haos Bakugans are on the field, the user's power get 100 G and allow the player to reuse any of their Ability Cards`,
    image: StandardCardsImages.haos,
    usable_in_neutral: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const haosOnDomain = roomState?.protalSlots.map((s) => s.bakugans?.filter((b) => b.attribut === 'Haos').map((b) => b.key) || [])

        if (slotOfGate && haosOnDomain) {
            const merged = haosOnDomain.flat()
            if (merged.length >= 2 && slotOfGate) {
                const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
                const player = roomState?.players.find((p) => p.userId === userId)

                if (user && player) {
                    user.currentPower += 100
                    player.usable_abilitys = 3
                    PowerChangeDirectiveAnumation({
                        animations: roomState?.animations,
                        bakugans: [user],
                        powerChange: 100,
                        malus: false
                    })
                }
            }
        }

        return null
    },
    onCanceled: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower -= 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: true
                })
            }
        }
    }
}