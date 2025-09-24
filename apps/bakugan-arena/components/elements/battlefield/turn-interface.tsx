'use client'

import { Button } from "@/components/ui/button"
import SetGateCardComponent from "./turn-interface-buttons/set-gate-card"
import SetBakuganComponent from "./turn-interface-buttons/set-bakugan"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { battleState } from "@bakugan-arena/game-data/src/type/room-types"
import UseAbilityCard from "./turn-interface-buttons/use-ability"
import ActivateGateCard from "./turn-interface-buttons/active-gate"
import useTurnActionStates from "@/src/hooks/turn-action-hook"
import { useEffect } from "react"
import { useSocket } from "@/src/providers/socket-provider"
import AbilityExtraInputs from "./turn-interface-buttons/abilities-extra-actions"
import UseAbilityCardInNeutral from "./turn-interface-buttons/use-ability-card-in-neutral"

export default function TurnInterface({ turn, set_gate, set_bakugan, roomId, battleState, userId }: { turn: boolean, set_gate: boolean, set_bakugan: boolean, use_ability: boolean, roomId: string, battleState: battleState | undefined, userId: string }) {
    const socket = useSocket()
    const turnActionHook = useTurnActionStates({ roomId: roomId, battleState: battleState, userId: userId })
    useEffect(() => {
        if (socket) {
            if (battleState && battleState.turns === 0) {
                socket.emit('resolve-battle', ({ roomId }))
            }
        }
    }, [battleState])

    if (!turn) {
        return (
            <p className="flex flex-col gap-2 lg:flex-row lg:absolute lg:left-[50%] bottom-7 lg:translate-x-[-50%] z-20">It's your opponent's turn</p>
        )
    } else {

        return (
            <>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="relative z-[20] lg:w-[15vw]">Actions</Button>
                    </DialogTrigger>

                    {
                        battleState && battleState.battleInProcess && !battleState.paused ?
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Battle Turn Actions</DialogTitle>
                                    <DialogDescription>
                                        Select the actions for the battle
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-2">
                                    <UseAbilityCard bakuganKey={turnActionHook.abilityUser} ability={turnActionHook.ability} roomId={roomId} userId={userId} selectAbility={turnActionHook.selectAbility} selectBakugan={turnActionHook.selectAbilityUser} />
                                    <AbilityExtraInputs bakuganToMove={turnActionHook.bakuganToMove} select_bakugan_to_move={turnActionHook.select_bakugan_to_move} select_destination={turnActionHook.select_destination} bakugaToAdd={turnActionHook.bakuganToAdd} select_bakugan_to_add={turnActionHook.select_bakugan_to_add} selectTarget={turnActionHook.selectTarget} target={turnActionHook.target} select_slot_to_drag={turnActionHook.select_slot_to_drag} slotToDrag={turnActionHook.slotToDrag} ability={turnActionHook.ability} selected_slot_to_move={turnActionHook.select_slot_to_move} selected_target={turnActionHook.selectTarget} slot_target={turnActionHook.slot_target} selected_target_slot={turnActionHook.select_slot_target} bakuganKey={turnActionHook.abilityUser} roomId={roomId} userId={userId} />
                                    <ActivateGateCard roomId={roomId} userId={userId} setActiveGate={turnActionHook.setActiveGate} />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant='destructive'>Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={turnActionHook.handleBattleActionComfirm}>Confirm</Button>
                                    <Button onClick={turnActionHook.handleSkipTurn} variant='destructive'>Skip Turn</Button>
                                </DialogFooter>
                            </DialogContent>

                            : <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Turn actions</DialogTitle>
                                    <DialogDescription>
                                        Select the actions
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-5">
                                    <SetGateCardComponent set_gate={set_gate} roomId={roomId} userId={userId} selectGate={turnActionHook.selectGate} selectSlot={turnActionHook.selectSlot} />
                                    <SetBakuganComponent set_bakugan={set_bakugan} roomId={roomId} userId={userId} selectBakugan={turnActionHook.selectBakuganToSet} selectZone={turnActionHook.selectZone} slot={turnActionHook.slot} gate={turnActionHook.gate} />
                                    <UseAbilityCardInNeutral zone={turnActionHook.zone} bakuganKey={turnActionHook.abilityUser} ability={turnActionHook.ability} roomId={roomId} userId={userId} selectAbility={turnActionHook.selectAbility} selectBakugan={turnActionHook.selectAbilityUser} abilityUser={turnActionHook.abilityUser} bakuganToSet={turnActionHook.bakuganToSet} />
                                    <AbilityExtraInputs bakuganToMove={turnActionHook.bakuganToMove} select_bakugan_to_move={turnActionHook.select_bakugan_to_move} select_destination={turnActionHook.select_destination} bakugaToAdd={turnActionHook.bakuganToAdd} select_bakugan_to_add={turnActionHook.select_bakugan_to_add} selectTarget={turnActionHook.selectTarget} target={turnActionHook.target} select_slot_to_drag={turnActionHook.select_slot_to_drag} slotToDrag={turnActionHook.slotToDrag} ability={turnActionHook.ability} selected_slot_to_move={turnActionHook.select_slot_to_move} selected_target={turnActionHook.selectTarget} slot_target={turnActionHook.slot_target} selected_target_slot={turnActionHook.select_slot_target} bakuganKey={turnActionHook.abilityUser} roomId={roomId} userId={userId} />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant='destructive'>Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={turnActionHook.handleConfirm}>Confirm</Button>
                                    <Button onClick={turnActionHook.handleSkipTurn} variant='destructive'>Skip Turn</Button>
                                </DialogFooter>
                            </DialogContent>
                    }

                </Dialog>
            </>

        )
    }
}