'use client'

import useActiveGateCard from "../sockets/active-gate-card"
import useGetRoomState from "../sockets/get-room-state"
import useSetBakugan from "../sockets/set-bakugan"
import useSetGate from "../sockets/set-gate"
import { slots_id } from "@bakugan-arena/game-data"
import useTurnAction from "../sockets/turn-action"
import { toast } from "sonner"
import { battleState } from "@bakugan-arena/game-data/src/type/room-types"
import useActiveAbilityCard from "../sockets/use-ability-card"
import { useTurnActionStore } from "../store/turn-actions-store"

// FR : Hook principal qui centralise les actions d’un tour de jeu (poser un portail, lancer un Bakugan, activer une capacité, activer un portail, etc.)
// EN : Main hook that centralizes turn actions (set a gate, throw a Bakugan, activate an ability, activate a gate, etc.)
export default function useTurnActionStates({ roomId, userId, battleState }: { roomId: string, userId: string, battleState: battleState | undefined }) {

    const turnActions = useTurnActionStore((state) => state.turnActions)
    const resetInputs = useTurnActionStore((state) => state.reset)


    // FR : Récupère l'état global de la room (plateau de jeu, slots, decks)
    // EN : Get the global room state (board, slots, decks)
    const { slots, roomState } = useGetRoomState({ roomId })

    // FR : Fonctions socket pour envoyer les actions au serveur
    // EN : Socket functions to send actions to the server
    const { SetGateCard } = useSetGate({ roomId: roomId, userId: userId })
    const { SetBakugan } = useSetBakugan({ roomId: roomId, userId: userId })
    const { ActiveGateCard } = useActiveGateCard({ roomId })
    const { ActiveAbilityCard } = useActiveAbilityCard({ roomId })
    const { turnAction } = useTurnAction({ roomId: roomId, userId: userId })


    // FR : Compte le nombre de Bakugans encore disponibles du joueur
    // EN : Count the number of available Bakugans for the player
    const usersBakugans = roomState?.decksState
        .find((d) => d.userId === userId)
        ?.bakugans.filter((b) => !b?.bakuganData.elimined && !b?.bakuganData.onDomain).length

    // FR : Vérifie les portails déjà posés sur le terrain
    // EN : Check gate cards already on the field
    const gateOnDomain = roomState?.protalSlots.filter((s) => s.portalCard !== null && !s.can_set)

    // FR : Réinitialise tous les inputs locaux après une action
    // EN : Reset all local inputs after an action

    // FR : Confirme une action de tour (poser portail, lancer Bakugan, activer capacité)
    // EN : Confirm a turn action (set gate, throw Bakugan, activate ability)
    const handleConfirm = () => {
        // FR : Si aucun portail utilisable n’est présent ET qu’aucun portail/slot n’a été choisi → erreur
        // EN : If no usable gate is on the field AND no gate/slot was selected → error
        if (roomState && roomState.turnState.turnCount <= 2) {
            if (turnActions.gate === '' && turnActions.slot === '') {
                toast.error('You must choice a usable gate card and a valid slot')
                console.log('Cas : 1')
                return
            } else {
                SetGateCard({ gateId: turnActions.gate, slot: turnActions.slot })
                console.log(turnActions.slot, turnActions.gate)
                console.log('Cas : 2')
                // FR : Fin de tour → signal au serveur
                // EN : End of turn → notify server
                turnAction()

            }
        } else if (battleState && !battleState.battleInProcess && roomState && roomState.turnState.turnCount > 2 && usersBakugans && usersBakugans > 0) {
            console.log('Cas : 3')
            // FR : Cas 1 → On est en dehors d’un combat, le tour est avancé (>2) et le joueur a encore des Bakugans
            // EN : Case 1 → Outside of battle, turn count > 2, and player still has Bakugans

            // FR : Vérifie que le joueur a bien sélectionné un Bakugan et une zone
            // EN : Check that player selected a Bakugan and a valid zone
            if (turnActions.bakuganToSet !== '' && turnActions.zone !== '') {
                // FR : Si un portail est aussi sélectionné, on le pose
                // EN : If a gate card is also selected, place it
                if (turnActions.gate !== '' && turnActions.slot !== '') {
                    SetGateCard({ gateId: turnActions.gate, slot: turnActions.slot })
                    console.log(turnActions.slot, turnActions.gate)
                }
                // FR : On lance le Bakugan choisi
                // EN : Throw the selected Bakugan
                SetBakugan({ bakuganKey: turnActions.bakuganToSet, slot: turnActions.zone })
                console.log(turnActions.slot, turnActions.bakuganToSet)

                // FR : Si une capacité est sélectionnée, on l’active
                // EN : If an ability is selected, activate it
                if (turnActions.abilityUser !== '' && turnActions.ability !== '') {
                    ActiveAbilityCard({
                        abilityId: turnActions.ability, bakuganKey: turnActions.abilityUser,
                        roomId: roomId, userId: userId,
                        target_slot: turnActions.slot_target, slot_to_move: turnActions.slot_to_move, target: turnActions.target,
                        slotToDrag: turnActions.slotToDrag, bakuganToAdd: turnActions.bakuganToAdd,
                        bakuganToMove: turnActions.bakuganToMove, destination: turnActions.destination,
                        zone: turnActions.zone as slots_id | ''
                    })
                }
                // FR : Fin de tour → signal au serveur
                // EN : End of turn → notify server
                turnAction()

            } else {
                // FR : Erreur si le joueur n’a pas lancé de Bakugan
                // EN : Error if player did not throw a Bakugan
                toast.error('You must throw a Bakugan')
                console.log('Cas : 4')

            }
        } else {
            console.log('Cas : 5')
            // FR : Cas 1 → On est en dehors d’un combat, le tour est avancé (>2) et le joueur a encore des Bakugans
            // EN : Case 1 → Outside of battle, turn count > 2, and player still has Bakugans

            // FR : Vérifie que le joueur a bien sélectionné un Bakugan et une zone
            // EN : Check that player selected a Bakugan and a valid zone
            if (turnActions.bakuganToSet !== '' && turnActions.zone !== '') {
                // FR : Si un portail est aussi sélectionné, on le pose
                // EN : If a gate card is also selected, place it
                if (turnActions.gate !== '' && turnActions.slot !== '') {
                    SetGateCard({ gateId: turnActions.gate, slot: turnActions.slot })
                    console.log(turnActions.slot, turnActions.gate)
                }
                // FR : On lance le Bakugan choisi
                // EN : Throw the selected Bakugan
                SetBakugan({ bakuganKey: turnActions.bakuganToSet, slot: turnActions.zone })
                console.log(turnActions.slot, turnActions.bakuganToSet)

                // FR : Si une capacité est sélectionnée, on l’active
                // EN : If an ability is selected, activate it
                if (turnActions.abilityUser !== '' && turnActions.ability !== '') {
                    ActiveAbilityCard({
                        abilityId: turnActions.ability, bakuganKey: turnActions.abilityUser,
                        roomId: roomId, userId: userId,
                        target_slot: turnActions.slot_target, slot_to_move: turnActions.slot_to_move, target: turnActions.target,
                        slotToDrag: turnActions.slotToDrag, bakuganToAdd: turnActions.bakuganToAdd,
                        bakuganToMove: turnActions.bakuganToMove, destination: turnActions.destination,
                        zone: turnActions.zone as slots_id | ''
                    })
                }
                // FR : Fin de tour → signal au serveur
                // EN : End of turn → notify server
                turnAction()

            }


            resetInputs()
        }
        
        resetInputs()
    }
    // FR : Confirme une action pendant une bataille (activation capacité ou portail)
    // EN : Confirm a battle action (ability activation or gate activation)
    const handleBattleActionComfirm = () => {
        // FR : Si une capacité est sélectionnée, on l’active
        // EN : If an ability is selected, activate it
        if (turnActions.abilityUser !== '' && turnActions.ability !== '') {
            ActiveAbilityCard({
                abilityId: turnActions.ability, bakuganKey: turnActions.abilityUser,
                roomId: roomId, userId: userId,
                target_slot: turnActions.slot_target, slot_to_move: turnActions.slot_to_move, target: turnActions.target,
                slotToDrag: turnActions.slotToDrag, bakuganToAdd: turnActions.bakuganToAdd,
                bakuganToMove: turnActions.bakuganToMove, destination: turnActions.destination
            })
        }

        // FR : Si l’activation d’un portail est demandée
        // EN : If portal activation is requested
        if (turnActions.active === true) {
            if (battleState && slots) {
                const battleInProcess = battleState.battleInProcess && !battleState.paused

                // FR : Cas 1 → Bataille en cours, on active le portail du slot de bataille
                // EN : Case 1 → Battle in progress, activate the gate card on the battle slot
                if (battleInProcess && battleState.slot !== null) {
                    const slot = battleState.slot
                    const gateId = slots.find((s) => s.id === slot)?.portalCard?.key

                    if (gateId) {
                        ActiveGateCard({ gateId: gateId, roomId: roomId, slot: slot, userId: userId })
                    }

                } else {
                    // FR : Cas 2 → Pas de bataille en cours, mais un slot spécifique a été choisi
                    // EN : Case 2 → No battle in progress, but a specific slot was selected
                    if (turnActions.slotToActive !== '' && turnActions.active) {
                        const slot = slots.find((s) => s.id === turnActions.slotToActive)?.id
                        const gateId = slots.find((s) => s.id === turnActions.slotToActive)?.portalCard?.key

                        if (slot && gateId) {
                            ActiveGateCard({ gateId: gateId, roomId: roomId, slot: slot, userId: userId })
                        }
                    }
                }
            }
        }

        // FR : Si une capacité ou un portail a été activé → fin du tour
        // EN : If an ability or a gate was activated → end turn
        if (turnActions.active || turnActions.abilityUser != '' && turnActions.ability != '') {
            turnAction()
        }
        resetInputs()
    }

    // FR : Passe le tour sans rien faire
    // EN : Skip turn without doing anything
    const handleSkipTurn = () => {
        turnAction()
        resetInputs()
    }

    return {

        handleConfirm,
        handleBattleActionComfirm,
        handleSkipTurn,
    }
