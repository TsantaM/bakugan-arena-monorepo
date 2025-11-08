import { CancelAbilityCard } from "../../function/cancel-ability-card"
import { CheckBattle } from "../../function/check-battle-in-process"
import { type exclusiveAbilitiesType } from "../../type/game-data-types"
import { type bakuganOnSlot } from "../../type/room-types"
import { GateCardsList } from "../gate-gards"

export const OmbreBleue: exclusiveAbilitiesType = {
    key: 'ombre-bleue',
    name: 'Ombre Bleue',
    description: `Ajoute 50G à l'utilisateur et empêche l'ouverture de la carte portail`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                user.currentPower += 50
            }
            slotOfGate.state.blocked = true
        }
    }
}

export const ChambreDeGravite: exclusiveAbilitiesType = {
    key: 'chambre-de-gravité',
    name: 'Chambre de Gravité',
    description: `Permet d'attirer un bakugan sur la carte portail où se trouve l'utilisateur.`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const DragonoidPlus: exclusiveAbilitiesType = {
    key: 'dragonoid-plus',
    name: 'Dragonoid Plus',
    description: `Ajoute 100G à l'utilisateur et l'effet persiste jusqu'à l'annulation de la capacité`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const ImpactMajeur: exclusiveAbilitiesType = {
    key: 'impact-majeur',
    name: 'Impact Majeur',
    description: `Ajoute 75G à l'utilisateur et baisse celui de l'adversaire de 75G tout en empêchant la carte portail de s'ouvir`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 75
            }
        }
    }
}

export const SabreDeLaMort: exclusiveAbilitiesType = {
    key: 'sabre-de-la-mort',
    name: 'Sabre de la Mort',
    description: `Permet à l'utilisateur de se déplacer vers une autre carte portail ou de joindre le combat s'il n'est pas encore sur le domaine`,
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
                }
            }
        }
    }
}

export const VentViolentDeNobelesseVerte: exclusiveAbilitiesType = {
    key: 'vent-violent-de-noblesse-verte',
    name: 'Vent Violent de Noblesse Verte',
    description: `Ajoute 100G à l'utilisateur`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const AntiMuse: exclusiveAbilitiesType = {
    key: 'anti-muse',
    name: 'Anti Muse',
    description: `Attire un Bakugan sur la carte portail où se trouve l'utilisateur`,
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    slotLimits: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot, target, slotToDrag }) => {

        if (!roomState) return

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        console.log(target, slotToDrag, slot)
        console.log(slotOfGate)
        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '' && slotToDrag !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)
            const condition = slotOfGate && slotTarget && bakuganToDrag && BakuganTargetIndex ? true : false

            console.log(slotTarget)
            console.log(bakuganToDrag)
            console.log(BakuganTargetIndex)
            console.log(condition)

            const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user && bakuganToDrag) {
                slotOfGate.bakugans.push(bakuganToDrag)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)

                roomState.battleState.battleInProcess = false
                roomState.battleState.paused = false
                roomState.battleState.slot = null
                roomState.battleState.turns = 2

                CheckBattle({ roomState })
            }
        }

    }
}

export const AileEnflamee: exclusiveAbilitiesType = {
    key: 'aile-enflammee',
    name: 'Aile enflammée',
    description: `Ajoute 50 G à l'utilisateur (effet persistant)`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 50
            }
        }
    }
}

export const VisageDuChagrin: exclusiveAbilitiesType = {
    key: 'visage-du-chagrin',
    name: 'Visage du Chagrin',
    description: `Rend toutes les carte maîtrises de l'adversaire inutiles et si l'utilisateur remporte le duel il redonne vie à tout bakugan alié vaincu au combat`,
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
    },
    onWin: ({ roomState, userId }) => {
        const deckToUpdate = roomState?.decksState.find((d) => d.userId === userId)
        console.log(userId)
        console.log('fortress win')
        if (deckToUpdate) {
            deckToUpdate.bakugans.filter((b) => b && b.bakuganData.elimined === true).forEach((b) => {
                b?.bakuganData.elimined ? b.bakuganData.elimined = false : b?.bakuganData.elimined
            })
        }
    },
}

export const VisageDeLaFureur: exclusiveAbilitiesType = {
    key: 'visage-de-la-fureur',
    name: 'Visage de la Fureur',
    description: `Ajoute 100 G à l'utilisateur et en retire autant à tous les adversaires`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 100
                opponents.forEach((opponent) => {
                    opponent.currentPower -= 100
                })
            }
        }
    }
}

export const VisageDeJoie: exclusiveAbilitiesType = {
    key: 'visage-de-joie',
    name: 'Visage de Joie',
    description: `Désactive la carte portail si elle est déjà ouverte et l'empêche de s'ouvrir si elle ne l'est pas encore. Si l'utilisateur gagne la batail il peut réutiliser toutes les cartes maîtrises qu'il a déjà utiliser`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const gate = GateCardsList.find((g) => g.key === slotOfGate?.portalCard?.key)

        if (slotOfGate && gate) {
            if (slotOfGate.state.open) {
                if (gate.onCanceled) {
                    gate.onCanceled({ roomState, slot, userId, bakuganKey })
                }
                slotOfGate.state.canceled = true
            } else {
                slotOfGate.state.blocked = true
            }
        }
    },
    onWin: ({ roomState, userId }) => {
        const deckToUpdate = roomState?.decksState.find((d) => d.userId === userId)
        const player = roomState?.players.find((p) => p.userId === userId)
        console.log(userId)
        console.log('fortress win')
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
    name: 'Gauche Gigantesque',
    description: `Détruit la carte portail de l'adversaire`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const MassueGigantesque: exclusiveAbilitiesType = {
    key: 'massue-gigantesque',
    name: 'Massue Gigantesque',
    description: `Ajoute 100G à l'utilisateur et en retire 50 à l'adversaire`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const TempeteDePlume: exclusiveAbilitiesType = {
    key: 'tempête-de-plume',
    name: 'Tempête de Plume',
    description: `Ajoute 100 G à l'utilisateur`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
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
    }
}

export const Marionnette: exclusiveAbilitiesType = {
    key: 'marionnette',
    name: 'Marionnette',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    description: "Permet de déplacer un Bakugan vers une autre carte portail",
    extraInputs: ['move-bakugan'],
    onActivate: ({ roomState, userId, bakuganKey, slot, bakuganToMove, destination }) => {
        console.log('bonsoir marionnatte')
        console.log(bakuganToMove, destination)
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (bakuganToMove && destination !== '') {
            const targetSlot = roomState?.protalSlots.find((s) => s.id === destination && s.portalCard !== null)
            const initialSlot = roomState?.protalSlots.find((s) => s.id === bakuganToMove?.slot)
            const bakuganTarget = initialSlot?.bakugans.find((b) => b.key === bakuganToMove?.bakuganKey && b.userId === bakuganToMove?.userId)
            const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            console.log(slotOfGate, targetSlot, initialSlot, bakuganTarget, user)

            if (user && slotOfGate && initialSlot && targetSlot && bakuganToMove && bakuganTarget) {
                const index = initialSlot.bakugans.findIndex((b) => b.key === bakuganToMove?.bakuganKey && b.userId === bakuganToMove?.userId)
                
                const newState: bakuganOnSlot = {
                    ...bakuganTarget,
                    slot_id: destination
                }
                
                targetSlot.bakugans.push(newState)
                initialSlot.bakugans.splice(index, 1)
                CheckBattle({ roomState })
            }
        }

    }
}

export const LanceEclair: exclusiveAbilitiesType = {
    key: 'lance-eclair',
    name: 'Lancé Eclair',
    description: `Permet à l'utilisateur d'envoyer son adversaire sur une autre carte portail`,
    maxInDeck: 1,
    extraInputs: ["move-opponent"],
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot, slot_to_move }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && roomState) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const index = slotOfGate.bakugans.findIndex((ba) => ba.key === opponent?.key && ba.userId === opponent.userId)
            const slotTarget = roomState?.protalSlots.find((s) => s.id === slot_to_move)
            if (user && opponent && slotTarget && slotTarget.portalCard !== null) {

                const newOpponentState: bakuganOnSlot = {
                    ...opponent,
                    slot_id: slotTarget.id
                }

                slotTarget.bakugans.push(newOpponentState)
                slotOfGate.bakugans.splice(index, 1)
                CheckBattle({ roomState })
                roomState.battleState.turns = 2
            }
        }
    }
}

export const MachettesJumelles: exclusiveAbilitiesType = {
    key: 'machettes-jumelles',
    name: 'Machette Jumelle',
    maxInDeck: 1,
    description: `Ajoute 100 G à l'utilisateur`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilityToCancel = slotOfGate.activateAbilities.find((a) => a.key === 'machettes-jumelles')
            if (user && abilityToCancel) {
                user.currentPower -= 100
                abilityToCancel.canceled = true
            }
        }
    },
}

export const RobotallionExecution: exclusiveAbilitiesType = {
    key: "robotalion-execution",
    name: 'Robotalion Execution',
    maxInDeck: 1,
    description: `Augmente le niveau de puissance de l'utilisateur de 50 G`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 50
            }
        }
    }
}

export const PlexusSolaire: exclusiveAbilitiesType = {
    key: 'plexus-solaire',
    name: 'Plexus Solaire',
    maxInDeck: 1,
    description: `Annule la carte portail si elle est ouverte et retire 50 G à l'adversaire`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const gate = GateCardsList.find((g) => g.key === slotOfGate.portalCard?.key)

            if (user && opponent) {
                opponent.currentPower -= 50
                if (gate && gate.onCanceled && slotOfGate.state.open && !slotOfGate.state.canceled) {
                    gate.onCanceled({ roomState: roomState, slot: slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }
            }


        }
    }
}

export const EffecteurdOmbre: exclusiveAbilitiesType = {
    key: `effaceur-d'ombre`,
    description: `Annule la carte portail si elle est ouverte ainsi que la carte portail de l'adversaire tout en lui retirant 50 G`,
    name: `Effaceur d'ombre`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const gateCard = GateCardsList.find((card) => card.key === slotOfGate.portalCard?.key)
            if (slotOfGate.state.open && !slotOfGate.state.canceled && gateCard && gateCard.onCanceled) {
                gateCard.onCanceled({ roomState: roomState, slot: slot, userId: userId, bakuganKey: bakuganKey })
            }
            slotOfGate.state.canceled = true

            if (user && opponent) {
                opponent.currentPower -= 50
            }
        }
    }
}

export const LanceDeFeu: exclusiveAbilitiesType = {
    key: 'lance-de-feu',
    name: 'Lance de Feu',
    maxInDeck: 1,
    description: `Ajoute 100 G à l'utilisateur`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const JavelotAquos: exclusiveAbilitiesType = {
    key: 'javelot-aquos',
    name: 'Javelot Aquos',
    maxInDeck: 1,
    description: `Permet à l'utilisateur d'échanger la place de deux cartes portails juxtaposées`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const Tsunami: exclusiveAbilitiesType = {
    key: 'tsunami',
    name: 'Tsunami',
    maxInDeck: 1,
    description: `Ne peux être activée que si trois (3) Bakugans aqos aliés sont sur le domaine, et élimine tout Bakuant présent sur le domaine ayant un niveau de puissance inférieur à l'utilisateur`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
    }
}

export const TrappeDeSable: exclusiveAbilitiesType = {
    key: 'trappe-de-sable',
    name: 'Trappe de Sable',
    description: `Permet d'attaquer un Bakugan se trouvant sur une autre carte portail et baise le niveau de puissance de la cible de 50 G`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 50
            }
        }
    }
}

export const MaitreDesProfondeurs: exclusiveAbilitiesType = {
    key: 'maitre-des-profondeurs',
    name: 'Maitre des profondeurs',
    description: `Ajoute 100 G à l'utilisateur`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
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
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
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
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 100
                opponents.forEach((opponent) => {
                    opponent.currentPower -= 100
                })
            }
        }
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
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
            }
        }
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
    onActivate: ({ roomState, userId, bakuganKey, slot, target, slotToDrag }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        console.log(target, slotToDrag, slot)
        console.log(slotOfGate)
        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '' && slotToDrag !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)
            const condition = slotOfGate && slotTarget && bakuganToDrag && BakuganTargetIndex ? true : false

            console.log(slotTarget)
            console.log(bakuganToDrag)
            console.log(BakuganTargetIndex)
            console.log(condition)

            const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user && bakuganToDrag) {
                bakuganToDrag.currentPower = bakuganToDrag.currentPower - 50
                slotOfGate.bakugans.push(bakuganToDrag)
                slotTarget.bakugans.splice(BakuganTargetIndex, 1)
                CheckBattle({ roomState })
            }
        }

    }
}