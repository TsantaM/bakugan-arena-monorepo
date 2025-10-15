'use client'

import { useFocusedBakugan } from "@/src/store/focused-bakugan-store"
import { useChangePowerLevelAnimation, useSetBakuganAnimation } from "@/src/store/global-animation-timeline-store"
import { useSpritePositionAnchor } from "@/src/store/sprites-positions-anchor"
import { attribut, bakuganOnSlot } from "@bakugan-arena/game-data"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import localFont from "next/font/local"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const squareMetal = localFont({
    src: [{
        path: "../../../../public/fonts/square_metall-7.ttf"
    }]
})

export default function BakuganSprite({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string }) {

    const { reset, setOpponentBakugan, opponentBakugan, setUsersBakugan, usersBakugan } = useFocusedBakugan()
    const bakuganRef = useRef(null)
    const bonusRef = useRef(null)
    const bakuganOverlay = useRef(null)
    const ImageOverlay = useRef(null)
    const [set, setSet] = useState<boolean | undefined>(false)
    const [currentPower, setCurrentPower] = useState<number | null>(null)
    const [change, setChange] = useState<number | null>(null)
    const { add: addSetBakuganAnimation } = useSetBakuganAnimation()
    const { add: powerLevelChange } = useChangePowerLevelAnimation()

    const setFocusedBakugan = () => {
        console.log(bakugan.userId, userId)

        if (bakugan.userId === userId) {
            setUsersBakugan(bakugan)
            console.log(usersBakugan)
        } else {
            setOpponentBakugan(bakugan)
            console.log(opponentBakugan)
        }
    }

    const resetStore = () => {
        reset()
        console.log(usersBakugan)
        console.log(opponentBakugan)

    }

    const position = useSpritePositionAnchor((state) => state.spritesPositions.find((p) => p.key === bakugan.key && p.userId === bakugan.userId))
    useSpritePositionAnchor((state) => state.refreshKey)

    function getAttributColor(attribut: attribut) {
        switch (attribut) {
            case 'Pyrus': return 'bg-red-500'
            case 'Aquos': return 'bg-blue-500'
            case 'Haos': return 'bg-yellow-400'
            case 'Darkus': return 'bg-purple-700'
            case 'Ventus': return 'bg-green-500'
            case 'Subterra': return 'bg-orange-600'
            default: return 'bg-gray-500'
        }
    }

    useEffect(() => {
        console.log(`y: ${position?.y}, x : ${position?.x}`)
        if (set === false && position) {
            setSet(true)
        }
    }, [position])

    useGSAP(() => {
        if (bakuganRef.current && bakuganOverlay.current && ImageOverlay.current && position) {
            if (set) {
                const origin = bakugan.userId === userId ? { x: '50%', y: '100%' } : { x: '50%', y: '0' }
                addSetBakuganAnimation((setBakuganTimeline) => {
                    setBakuganTimeline.fromTo([bakuganOverlay.current, bakuganRef.current],
                        {
                            opacity: 0,
                            borderRadius: '50%',
                            top: origin.y,
                            left: origin.x,
                            scale: 0.5,
                        },
                        {
                            opacity: 1,
                            top: `${position.y - 20 + position.h / 2}px`,
                            left: `${position.x + 10 + position.w / 2}px`,
                            scale: 0.5,
                            duration: 1,
                            ease: "power2.out",
                        }
                    )
                    setBakuganTimeline.fromTo([bakuganOverlay.current, bakuganRef.current],
                        {
                            scale: 0.5
                        },
                        {
                            scale: 1
                        }
                    )
                    setBakuganTimeline.to(bakuganRef.current, {
                        borderRadius: 0
                    })
                    setBakuganTimeline.fromTo(bakuganOverlay.current,
                        {
                            opacity: 1
                        },
                        {
                            opacity: 0,
                        }
                    )
                    setBakuganTimeline.fromTo(ImageOverlay.current,
                        {
                            y: 15,
                            opacity: 0
                        },
                        {
                            y: 0,
                            opacity: 1,
                        }
                    )
                })
            }
        }
    }, [bakuganRef.current, set])

    useEffect(() => {
        if (currentPower !== null && bakugan.currentPower !== currentPower) {
            const powerChange = bakugan.currentPower > currentPower ? bakugan.currentPower - currentPower : currentPower - bakugan.currentPower
            setChange(powerChange)
        }
        if (currentPower === null) {
            setCurrentPower(bakugan.currentPower)
        }
    }, [bakugan.currentPower])

    useGSAP(() => {

        if (change && bonusRef.current) {
            powerLevelChange((powerChange) => {
                powerChange.fromTo(bonusRef.current,
                    {
                        y: 0,
                        opacity: 0,
                    },
                    {
                        y: -15,
                        opacity: 1,
                        duration: 0.5,
                        onComplete: () => {
                            setCurrentPower(bakugan.currentPower)
                            setChange(null)
                        }
                    })
            })
        }

    }, [change, bonusRef.current])

    if (!position) return

    return (
        <div ref={bakuganRef} className={`fixed z-10 size-12 lg:size-20`} style={{
            top: `${position.y - 20 + position.h / 2}px`,
            left: `${position.x + 10 + position.w / 2}px`,
            transform: 'translate(-50%, -50%)'
        }} onMouseEnter={setFocusedBakugan} onMouseLeave={resetStore}>
            {change !== null && <p className={`${squareMetal.className} absolute text-2xl md:text-4xl w-3xl`} ref={bonusRef}>{`${currentPower && bakugan.currentPower > currentPower ? "+" : '-'} ${change}`}</p>}
            <Image ref={ImageOverlay} src={`/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`} alt={bakugan.key} fill />
            <div ref={bakuganOverlay} className={`w-full h-full opacity-0 ${getAttributColor(bakugan.attribut)}`}></div>
        </div>
    )
}