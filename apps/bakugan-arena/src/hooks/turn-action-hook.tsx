'use client'

import { useState } from "react"
import useActiveGateCard from "../sockets/active-gate-card"
import useGetRoomState from "../sockets/get-room-state"
import useSetBakugan from "../sockets/set-bakugan"
import useSetGate from "../sockets/set-gate"
import { AbilityCardsList, ExclusiveAbilitiesList, slots_id } from "@bakugan-arena/game-data"
import useTurnAction from "../sockets/turn-action"
import { toast } from "sonner"
import { battleState } from "@bakugan-arena/game-data/src/type/room-types"
import useActiveAbilityCard from "../sockets/use-ability-card"

export default function useTurnActionStates({ roomId, userId, battleState }: { roomId: string, userId: string, battleState: battleState | undefined }) {
    const { slots, roomState } = useGetRoomState({ roomId })
    const { SetGateCard } = useSetGate({ roomId: roomId, userId: userId })
    const { SetBakugan } = useSetBakugan({ roomId: roomId, userId: userId })
    const { ActiveGateCard } = useActiveGateCard({ roomId })
    const { ActiveAbilityCard } = useActiveAbilityCard({ roomId })
    const { turnAction } = useTurnAction({ roomId: roomId, userId: userId })

    // Gate id when chose a gate to set
    const [gate, setGate] = useState<string>("")

    // Slot where the gate card will be set
    const [slot, setSlot] = useState<slots_id | ''>("")

    // Bakugan key when set a bakugan
    const [bakuganToSet, setBakuganToSet] = useState("")

    // Slot where the bakugan will be set
    const [zone, setZone] = useState("")

    // Ability Card choices
    const [ability, setAbility] = useState('')

    // Bakugan how will use the ability
    const [abilityUser, setAbilityUser] = useState('')

    // Boolean for gate card activation
    const [active, setActive] = useState(false)

    // Slot where the gate to active is
    const [slotToActive, setSlotToActive] = useState<slots_id | ''>('')

    // Extra inputs
    const [target, setTarget] = useState('')
    const [slot_target, set_slot_target] = useState<slots_id | ''>('')
    const [slot_to_move, set_slot_to_move] = useState<slots_id | ''>('')
    // Slot of bakugan to drag
    const [slotToDrag, setSlotToDrag] = useState<slots_id | ''>('')
    // Select bakugan to add on battlefield
    const [bakuganToAdd, setBakuganToAdd] = useState('')

    const selectTarget = (bakuganKey: string) => {
        setTarget(bakuganKey)
    }

    const select_slot_target = (slot_target: slots_id) => {
        set_slot_target(slot_target)
    }

    const select_slot_to_move = (slot_to_move: slots_id) => {
        set_slot_to_move(slot_to_move)
    }

    const select_slot_to_drag = (slot_target: slots_id) => {
        setSlotToDrag(slot_target)
    }

    const select_bakugan_to_add = (bakuganToAdd: string) => {
        setBakuganToAdd(bakuganToAdd)
    }

    // Sates handler for children components

    // Gate Card Set
    const selectGate = (gate: string) => {
        setGate(gate)
    }

    const selectSlot = (slot: slots_id) => {
        setSlot(slot)
    }

    // Bakugan Brawl
    const selectBakuganToSet = (bakugan: string) => {
        setBakuganToSet(bakugan)
    }

    const selectZone = (zone: string) => {
        setZone(zone)
    }

    // Ability Card Activation
    const selectAbilityUser = (bakugan: string) => {
        setAbilityUser(bakugan)
    }

    const selectAbility = (ability: string) => {
        setAbility(ability)
    }


    // Gate Card Open
    const selectGateToActiveSlot = (slot: slots_id) => {
        setSlotToActive(slot)
    }

    const setActiveGate = (active: boolean) => {
        setActive(active)
    }


    // Fuction of for confirm turn
    const usersBakugans = roomState?.decksState.find((d) => d.userId === userId)?.bakugans.filter((b) => !b?.bakuganData.elimined && !b?.bakuganData.onDomain).length
    const gateOnDomain = roomState?.protalSlots.filter((s) => s.portalCard !== null && !s.can_set)


    const handleConfirm = () => {
        if (gateOnDomain?.length === 0 && gate === '' && slot === '') {
            toast.error('You must choice a usable gate card and a valid slot')
            return
        } else {
            if (battleState && !battleState.battleInProcess && roomState && roomState.turnState.turnCount > 2 && usersBakugans && usersBakugans > 0) {
                if (bakuganToSet != '' && zone != '') {
                    if (gate != '' && slot != '') {
                        SetGateCard({ gateId: gate, slot: slot })
                        console.log(slot, gate)
                    }
                    SetBakugan({ bakuganKey: bakuganToSet, slot: zone })
                    console.log(slot, bakuganToSet)
                    turnAction()

                } else {
                    toast.error('You must throw a Bakugan')
                }
            } else {
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

        setGate('')
        setSlot('')
        setZone('')
        setBakuganToSet('')
    }

    const handleBattleActionComfirm = () => {
        if (abilityUser != '' && ability != '') {
            ActiveAbilityCard({ abilityId: ability, bakuganKey: abilityUser, roomId: roomId, userId: userId, target_slot: slot_target, slot_to_move: slot_to_move, target: target, slotToDrag: slotToDrag, bakuganToAdd: bakuganToAdd })
        }

        if (active === true) {
            if (battleState && slots) {
                const battleInProcess = battleState.battleInProcess && !battleState.paused

                if (battleInProcess && battleState.slot !== null) {
                    const slot = battleState.slot
                    const gateId = slots.find((s) => s.id === slot)?.portalCard?.key

                    if (gateId) {
                        ActiveGateCard({ gateId: gateId, roomId: roomId, slot: slot, userId: userId })
                    }

                } else {
                    if (slotToActive != '' && active) {
                        const slot = slots.find((s) => s.id === slotToActive)?.id
                        const gateId = slots.find((s) => s.id === slotToActive)?.portalCard?.key

                        if (slot && gateId) {
                            ActiveGateCard({ gateId: gateId, roomId: roomId, slot: slot, userId: userId })
                            setActive(false)
                        }
                    }
                }

            }
        }

        if (active || abilityUser != '' && ability != '') {
            turnAction()
        }
    }

    const handleSkipTurn = () => {
        turnAction()
    }

    return {
        gate,
        setGate,
        slot,
        setSlot,
        bakuganToSet, setBakuganToSet,
        zone, setZone,
        ability, setAbility,
        abilityUser, setAbilityUser,
        active, setActive,
        slotToActive, setSlotToActive,
        target, selectTarget,
        slot_target, select_slot_target,
        slot_to_move, select_slot_to_move,
        slotToDrag, select_slot_to_drag,
        bakuganToAdd, select_bakugan_to_add,

        handleConfirm,
        handleBattleActionComfirm,
        handleSkipTurn,
        selectGate,
        selectSlot,
        selectBakuganToSet,
        selectZone,
        selectAbilityUser,
        selectAbility,
        selectGateToActiveSlot,
        setActiveGate,
    }
}