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
import { stateType } from "@bakugan-arena/game-data/src/type/room-types"
import UseAbilityCard from "./turn-interface-buttons/use-ability"
import ActivateGateCard from "./turn-interface-buttons/active-gate"
import useTurnActionStates from "@/src/hooks/turn-action-hook"
import { useSocket } from "@/src/providers/socket-provider"
import AbilityExtraInputs from "./turn-interface-buttons/abilities-extra-actions"
import UseAbilityCardInNeutral from "./turn-interface-buttons/use-ability-card-in-neutral"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useAninmationInProcess, useChangePowerLevelAnimation, useGameFinishedAnimation, useGateCardStateChangeAnimation, useSetBakuganAnimation, useSetGateCardAnimation } from "@/src/store/global-animation-timeline-store"
import gsap from "gsap"

export default function TurnInterface({ roomId, userId }: { roomId: string, userId: string }) {
    const socket = useSocket()
    const roomState = useGlobalGameState((state) => state.gameState)
    const battleState = useGlobalGameState((state) => state.gameState?.battleState)
    const turnState = useGlobalGameState((state) => state.gameState?.turnState)
    const set_bakugan = useGlobalGameState((state) => state.gameState?.turnState.set_new_bakugan)
    const refresh = useGlobalGameState((state) => state.setRefreshKey)
    const setGateState = useGlobalGameState((state) => state.setGlobalState)
    const finished = useGlobalGameState((state) => state.gameState?.status.finished)

    const turnActionHook = useTurnActionStates({ roomId: roomId, battleState: battleState, userId: userId })

    const { tl: setGateTimeline } = useSetGateCardAnimation((state) => state.tl)
    const { tl: setBakuganTimeline } = useSetBakuganAnimation((state) => state.tl)
    const { tl: gateCardStateChange } = useGateCardStateChangeAnimation((state) => state.tl)
    const { tl: powerLevelChange } = useChangePowerLevelAnimation((state) => state.tl)
    const { tl: gameFinished } = useGameFinishedAnimation((state) => state.tl)

    const setSlotToMap = useGlobalGameState((state) => state.setSlots)
    const animationInProcess = useAninmationInProcess((state) => state.animationInProcess)
    const setInProcess = useAninmationInProcess((state) => state.setInProcess)

    const resolveBattle = () => {
        if (socket) {
            console.log('clicked')
            socket.emit('resolve-battle', ({ roomId }))
            socket.on('update-room-state', (state: stateType) => {
                if (!state) return
                setGateState(state)
                setSlotToMap(state?.protalSlots)

                const globalTimeLine = gsap.timeline({
                    paused: true,
                    onStart: () => setInProcess(true),
                    onComplete: () => setInProcess(false)
                })
                globalTimeLine
                    .add(setGateTimeline)
                    .add(setBakuganTimeline)
                    .add(gateCardStateChange)
                    .add(powerLevelChange)
                    .add(gameFinished)

                globalTimeLine.play()

                return () => {
                    globalTimeLine.kill()
                }
            })
            refresh()
        }
    }
    if (!turnState) return
    if (finished === true) return

    if (turnState.turn !== userId) {
        return (

            roomState?.battleState && roomState.battleState.battleInProcess && roomState?.battleState?.turns === 0 ? <Button className="flex gap-2 flex-row absolute left-[50%] bottom-7 translate-x-[-50%] z-20" onClick={resolveBattle}>Resolve Battle</Button> : <p className="flex gap-2 flex-row absolute left-[50%] bottom-7 translate-x-[-50%] z-20">It's your opponent's turn</p>


        )
    } else {

        return (
            roomState?.battleState && roomState.battleState.battleInProcess && roomState?.battleState?.turns === 0 && animationInProcess ? <Button className="flex gap-2 flex-row absolute left-[50%] bottom-7 translate-x-[-50%] z-20" onClick={resolveBattle}>Resolve Battle</Button> :
                <>
                    <Dialog>
                        <DialogTrigger asChild className="flex gap-2 flex-row absolute left-[50%] bottom-7 translate-x-[-50%] z-20">
                            <Button className="lg:w-[15vw]">Actions</Button>
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
                                        <UseAbilityCard roomId={roomId} userId={userId} />

                                        <AbilityExtraInputs userId={userId} />

                                        <ActivateGateCard roomId={roomId} userId={userId} />
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
                                        <SetGateCardComponent userId={userId} />

                                        <SetBakuganComponent set_bakugan={set_bakugan ? set_bakugan : false} userId={userId} />

                                        <UseAbilityCardInNeutral roomId={roomId} userId={userId} />

                                        <AbilityExtraInputs userId={userId} />
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