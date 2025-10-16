'use client'

import { BakuganList, GateCardsList, GetGateCardImage, slots_id } from "@bakugan-arena/game-data"
import Image from "next/image"
import { useGSAP } from '@gsap/react'
import { useEffect, useRef, useState } from "react"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import Anchor from "./anchor"
import { useGateCardStateChangeAnimation, useSetGateCardAnimation } from "@/src/store/global-animation-timeline-store"
import { useSpritePositionAnchor } from "@/src/store/sprites-positions-anchor"

export default function GateCardOnBoard({ userId, slotId }: { userId: string, slotId: slots_id }) {

    const slot = useGlobalGameState((state) => state.gameState?.protalSlots.find((s) => s.id === slotId))
    const removeGateOverlay = useRef(null)
    const setGateOverlay = useRef(null)
    const openGateOverlay = useRef(null)
    const stateChangeOverlay = useRef(null)
    const image = useRef(null)
    const [set, setSet] = useState<boolean>(false)
    const [removeGate, setRemoveGate] = useState(false)
    const [open, setOpen] = useState(false)
    const [state, setState] = useState(false)
    const positions = useSpritePositionAnchor((state) => state.spritesPositions)
    const { add: addGateCardTimeline } = useSetGateCardAnimation()
    const { add: addGateCardStateChangeAnimation } = useGateCardStateChangeAnimation()

    const gateCardData = GateCardsList.find((g) => g.key === slot?.portalCard?.key)

    if (!slot) return

    useEffect(() => {
        if (slot.portalCard !== null) {
            setSet(true)
        }

        if (slot.portalCard === null && !removeGate && set) {
            setRemoveGate(true)
            console.log(removeGate)
        }

        if (slot.state.open === true && !open) {
            setOpen(true)
        }

    }, [slot.portalCard, slot.state.open, useGlobalGameState((state) => state.refreshKey)])

    useEffect(() => {
        if (slot.state.canceled && !state) {
            setState(true)
        }

        if (slot.state.blocked && !state) {
            setState(true)
        }
    }, [slot.state.canceled, slot.state.blocked])

    useEffect(() => {
        if (slot.can_set === true) {
            setSet(false)
            setOpen(false)
            setState(false)
        }
    }, [slot])

    useGSAP(() => {
        if (setGateOverlay.current && image.current) {
            console.log('setGateCard')
            if (set) {
                addGateCardTimeline((setGateCard) => {
                    setGateCard.fromTo([setGateOverlay.current, image.current], {
                        opacity: 1,
                        scale: 0
                    },
                        {
                            scale: 1,
                        })
                    setGateCard.fromTo(setGateOverlay.current,
                        {
                            opacity: 1,
                        }, {
                        opacity: 0,
                        display: 'none'
                    })
                })
            }
        }

        console.log(removeGateOverlay.current)
        if (removeGateOverlay.current) {
            console.log('in ' + set)
            if (removeGate) {
                console.log(set)
                console.log(removeGateOverlay.current)
                addGateCardStateChangeAnimation((removeGateCard) => {
                    removeGateCard.fromTo(removeGateOverlay.current, {
                        opacity: 0,
                    },
                        {
                            opacity: 1,
                        })
                    removeGateCard.to(removeGateOverlay.current, {
                        opacity: 0,
                        display: 'none',
                        onComplete: () => setRemoveGate(false)
                    })
                })
                console.log('animation close')
            } else {
                return
            }
        }
    }, [set, removeGate, setGateOverlay.current, removeGateOverlay.current])

    useGSAP(() => {

        if (openGateOverlay.current) {
            if (open) {
                addGateCardStateChangeAnimation((openGateCard) => {
                    openGateCard.fromTo(openGateOverlay.current,
                        {
                            display: 'block',
                            opacity: 0
                        },
                        {
                            opacity: 1,
                        }
                    )
                    openGateCard.fromTo(image,
                        {
                            display: 'block',
                            opacity: 0
                        },
                        {
                            opacity: 1
                        }
                    )
                    openGateCard.to(openGateOverlay.current,
                        {
                            opacity: 0,
                            display: 'none',
                        }
                    )
                })
            }

        }
    }, [openGateOverlay.current, open])

    useGSAP(() => {

        if (stateChangeOverlay.current && state) {

            if (state) {
                addGateCardStateChangeAnimation((stateChange) => {
                    stateChange.fromTo(stateChangeOverlay.current,
                        {
                            opacity: 0
                        },
                        {
                            opacity: 0.5
                        }
                    )
                    stateChange.to(image.current,
                        {
                            opacity: 0.5,
                            onComplete: () => setState(false)
                        }
                    )
                })
            }
        }

    }, [stateChangeOverlay.current, state])

    const playerBakugans = slot.bakugans.filter((b) => b.userId === userId)
    const oponentsBakugans = slot.bakugans.filter((b) => b.userId !== userId)

    return (
        <HoverCard>
            <HoverCardTrigger>
                <div className={`relative aspect-[2/3] flex items-center justify-center border-2 border-[var(--foreground)] duration-75`}>
                    {
                        !slot.can_set && slot.portalCard !== null ?
                            <>
                                <Image ref={image} src={!slot.state.open ? "/images/cards/portal_card.png" : `/images/cards/${GetGateCardImage({ slot: slot })}`} alt='gate-card-design' fill />

                                <div ref={setGateOverlay} className="overlay z-20 absolute w-full h-full top-0 left-0 bg-cyan-100 shadow-2xs shadow-cyan-300 opacity-0"></div>
                                <div ref={openGateOverlay} className="overlay z-20 absolute w-full h-full top-0 left-0 bg-cyan-100 shadow-2xs shadow-cyan-300 opacity-0"></div>
                                <div ref={stateChangeOverlay} className="overlay z-20 absolute w-full h-full top-0 left-0 bg-neutral-950 shadow-2xs opacity-0"></div>

                                <div className="relative w-full h-full flex flex-col justify-between items-center p-5">
                                    <div className="relative z-40 flex items-center self-end gap-3">
                                        {

                                            oponentsBakugans.map((o) =>
                                                <Anchor bakugan={o} key={`${o.userId}-${o.key}-${o.id}`} slotId={slotId} />
                                            )

                                        }
                                    </div>

                                    <div className="relative z-40 flex items-center self-start gap-3">
                                        {
                                            playerBakugans.map((p) =>
                                                <Anchor bakugan={p} key={`${p.userId}-${p.key}-${p.id}`} slotId={slotId} />
                                            )
                                        }
                                    </div>
                                </div>

                            </> : <div></div>
                    }
                    {slot.portalCard === null &&
                        <div ref={removeGateOverlay} className="overlay z-20 absolute w-full h-full top-0 left-0 bg-cyan-100 shadow-2xs shadow-cyan-300 opacity-0"></div>}
                </div>
            </HoverCardTrigger>
            {
                slot.portalCard !== null && gateCardData && <HoverCardContent>
                    <div className="space-y-2">
                        <h4 className="text-sm"><span>Name : </span> {slot.portalCard.userId !== userId && !slot.state.open ? '???' : gateCardData.name}</h4>
                        <p className="text-sm"><span>Attribut : </span> {slot.portalCard.userId !== userId && !slot.state.open ? '???' : gateCardData.attribut ? gateCardData.attribut : 'No attribut'}</p>
                        <p className="text-sm">
                            <span>Description : </span> {slot.portalCard.userId !== userId && !slot.state.open ? '???' : gateCardData.description}
                        </p>

                        {
                            slot.bakugans.map((b, index) => <div key={index} className="flex flex-col gap-2">
                                <h5>{BakuganList.find((bakugan) => bakugan.key === b.key)?.name}</h5>
                                <ul>
                                    {
                                        slot.activateAbilities.filter((a) => a.bakuganKey === b.key && a.userId === b.userId).map((a, index) => <li key={index}>{a.key} {`(${a.canceled ? 'Canceled' : 'Active'})`}</li>)   
                                    }
                                </ul>
                            </div>)
                        }
                    </div>
                </HoverCardContent>
            }
        </HoverCard>
    )
}