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
import UseAbilityCardHook from "./use-ability-card-hook"
import useSetGateCardHook from "./set-gate-card-hook"
import useSetBakuganHook from "./set-bakugan-hook"
import useActiveGateCardHook from "./active-gate-card-hook"

// FR : Hook principal qui centralise les actions d’un tour de jeu (poser un portail, lancer un Bakugan, activer une capacité, activer un portail, etc.)
// EN : Main hook that centralizes turn actions (set a gate, throw a Bakugan, activate an ability, activate a gate, etc.)
export default function useTurnActionStates({ roomId, userId, battleState }: { roomId: string, userId: string, battleState: battleState | undefined }) {
    
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

    // FR : Gestion locale de la sélection de carte portail
    // EN : Local state management for portal card selection
    const { gate, selectGate, slot, selectSlot } = useSetGateCardHook()

    // FR : Gestion locale de la sélection de Bakugan
    // EN : Local state management for Bakugan selection
    const { bakuganToSet, selectBakuganToSet, zone, selectZone } = useSetBakuganHook()

    // FR : Gestion locale de la sélection d’une carte capacité
    // EN : Local state management for ability card selection
    const {
        ability, abilityUser, bakuganToAdd, bakuganToMove, destination,
        selectTarget, select_bakugan_to_add, select_bakugan_to_move, select_destination,
        select_slot_target, select_slot_to_drag, select_slot_to_move,
        selectAbility, selectAbilityUser, slotToDrag, slot_target, slot_to_move, target,
    } = UseAbilityCardHook()

    // FR : Gestion locale de l’activation d’une carte portail
    // EN : Local state management for portal card activation
    const { active, slotToActive, setActiveGate, selectGateToActiveSlot } = useActiveGateCardHook()

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
    const resetInputs = () => {
        selectGate('')
        selectSlot('')
        selectBakuganToSet('')
        selectZone('')
        selectAbility('')
        selectAbilityUser('')
        selectTarget('')
        select_slot_target('')
        select_slot_to_move('')
        select_slot_to_drag('')
        select_bakugan_to_add('')
        select_bakugan_to_move(undefined)
        select_destination('')
        setActiveGate(false)
        selectGateToActiveSlot('')
    }

    // FR : Confirme une action de tour (poser portail, lancer Bakugan, activer capacité)
    // EN : Confirm a turn action (set gate, throw Bakugan, activate ability)
    const handleConfirm = () => {
        // FR : Si aucun portail utilisable n’est présent ET qu’aucun portail/slot n’a été choisi → erreur
        // EN : If no usable gate is on the field AND no gate/slot was selected → error
        if (gateOnDomain?.length === 0 && gate === '' && slot === '') {
            toast.error('You must choice a usable gate card and a valid slot')
            return
        } else {
            // FR : Cas 1 → On est en dehors d’un combat, le tour est avancé (>2) et le joueur a encore des Bakugans
            // EN : Case 1 → Outside of battle, turn count > 2, and player still has Bakugans
            if (battleState && !battleState.battleInProcess && roomState && roomState.turnState.turnCount > 2 && usersBakugans && usersBakugans > 0) {
                // FR : Vérifie que le joueur a bien sélectionné un Bakugan et une zone
                // EN : Check that player selected a Bakugan and a valid zone
                if (bakuganToSet != '' && zone != '') {
                    // FR : Si un portail est aussi sélectionné, on le pose
                    // EN : If a gate card is also selected, place it
                    if (gate != '' && slot != '') {
                        SetGateCard({ gateId: gate, slot: slot })
                        console.log(slot, gate)
                    }
                    // FR : On lance le Bakugan choisi
                    // EN : Throw the selected Bakugan
                    SetBakugan({ bakuganKey: bakuganToSet, slot: zone })
                    console.log(slot, bakuganToSet)

                    // FR : Si une capacité est sélectionnée, on l’active
                    // EN : If an ability is selected, activate it
                    if (abilityUser != '' && ability != '') {
                        ActiveAbilityCard({
                            abilityId: ability, bakuganKey: abilityUser,
                            roomId: roomId, userId: userId,
                            target_slot: slot_target, slot_to_move: slot_to_move, target: target,
                            slotToDrag: slotToDrag, bakuganToAdd: bakuganToAdd,
                            bakuganToMove: bakuganToMove, destination: destination,
                            zone: zone as slots_id | ''
                        })
                    }
                    // FR : Fin de tour → signal au serveur
                    // EN : End of turn → notify server
                    turnAction()

                } else {
                    // FR : Erreur si le joueur n’a pas lancé de Bakugan
                    // EN : Error if player did not throw a Bakugan
                    toast.error('You must throw a Bakugan')
                }
            } else {
                // FR : Cas 2 → On est en début de partie OU en combat : le joueur ne peut poser qu’un portail
                // EN : Case 2 → Start of game OR during battle: player can only set a gate card
                if (gate != '' && slot != '') {
                    SetGateCard({ gateId: gate, slot: slot })
                    console.log(slot, gate)
                    turnAction()
                } else {
                    toast.error('You must choice a usable gate card and a valid slot')
                    console.log(slot, gate)
                }
            }
        }

        setActiveGate(false)
        resetInputs()
    }

    // FR : Confirme une action pendant une bataille (activation capacité ou portail)
    // EN : Confirm a battle action (ability activation or gate activation)
    const handleBattleActionComfirm = () => {
        // FR : Si une capacité est sélectionnée, on l’active
        // EN : If an ability is selected, activate it
        if (abilityUser != '' && ability != '') {
            ActiveAbilityCard({
                abilityId: ability, bakuganKey: abilityUser,
                roomId: roomId, userId: userId,
                target_slot: slot_target, slot_to_move: slot_to_move, target: target,
                slotToDrag: slotToDrag, bakuganToAdd: bakuganToAdd,
                bakuganToMove: bakuganToMove, destination: destination
            })
        }

        // FR : Si l’activation d’un portail est demandée
        // EN : If portal activation is requested
        if (active === true) {
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
                    if (slotToActive != '' && active) {
                        const slot = slots.find((s) => s.id === slotToActive)?.id
                        const gateId = slots.find((s) => s.id === slotToActive)?.portalCard?.key

                        if (slot && gateId) {
                            ActiveGateCard({ gateId: gateId, roomId: roomId, slot: slot, userId: userId })
                            setActiveGate(false)
                        }
                    }
                }
            }
        }

        // FR : Si une capacité ou un portail a été activé → fin du tour
        // EN : If an ability or a gate was activated → end turn
        if (active || abilityUser != '' && ability != '') {
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
        gate, selectGate,
        slot, selectSlot,
        bakuganToSet, selectBakuganToSet,
        zone, selectZone,
        ability, selectAbility,
        abilityUser, selectAbilityUser,
        active, setActiveGate,
        slotToActive, selectGateToActiveSlot,
        target, selectTarget,
        slot_target, select_slot_target,
        slot_to_move, select_slot_to_move,
        slotToDrag, select_slot_to_drag,
        bakuganToAdd, select_bakugan_to_add,
        bakuganToMove, select_bakugan_to_move,
        destination, select_destination,

        handleConfirm,
        handleBattleActionComfirm,
        handleSkipTurn,
    }
}
