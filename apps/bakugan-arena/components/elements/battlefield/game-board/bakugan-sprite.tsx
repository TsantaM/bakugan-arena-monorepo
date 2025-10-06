'use client'

import { useFocusedBakugan } from "@/src/store/focused-bakugan-store"
import { useSpritePositionAnchor } from "@/src/store/sprites-positions-anchor"
import { bakuganOnSlot } from "@bakugan-arena/game-data"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function BakuganSprite({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string }) {

    const { reset, setOpponentBakugan, opponentBakugan, setUsersBakugan, usersBakugan } = useFocusedBakugan()
    const bakuganRef = useRef(null)
    const [set, setSet] = useState<boolean | undefined>(false)

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


    useEffect(() => {
        console.log(`y: ${position?.y}, x : ${position?.x}`)
        if(set === false && position){
            setSet(true)
        }
    }, [position])

    useGSAP(() => {
        if (bakuganRef.current && position) {
            if(set) {
            const origin = bakugan.userId === userId ? { x: '50%', y: '90%' } : { x: '10%', y: '50%' }
            gsap.fromTo(bakuganRef.current,
                {
                    top: origin.y,
                    left: origin.x,
                    scale: 0.5,
                },
                {
                    top: `${position.y - 20 + position.h / 2}px`,
                    left: `${position.x + 10 + position.w / 2}px`,
                    scale: 1,
                    duration: 1,
                    ease: "power2.out",
                }
            )
            }
        }
    }, [bakuganRef.current, set])

    if (!position) return

    return (
        <div ref={bakuganRef} className={`fixed z-10 size-12 lg:size-20`} style={{
            top: `${position.y - 20 + position.h / 2}px`,
            left: `${position.x + 10 + position.w / 2}px`,
            transform: 'translate(-50%, -50%)'
        }} onMouseEnter={setFocusedBakugan} onMouseLeave={resetStore}>
            <Image src={`/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`} alt={bakugan.key} fill />
        </div>
    )
}