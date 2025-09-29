'use client'

import Image from "next/image"
import localFont from 'next/font/local'
import { attribut, bakuganOnSlot, portalSlotsTypeElement } from "@bakugan-arena/game-data"
import { useEffect, useRef, useState } from "react"
import { useSocket } from "@/src/providers/socket-provider"
import { battleState } from "@bakugan-arena/game-data/src/type/room-types"

const squareMetal = localFont({
    src: [{
        path: "../../../../public/fonts/square_metall-7.ttf"
    }]
})


export function BattleBakuganPreview({ slot, userId, battleState, roomId }: { slot: portalSlotsTypeElement, userId: string, battleState: battleState | undefined, roomId: string }) {

    const bakugans = slot.bakugans.filter((b) => b.userId === userId)
    const powerLevel = bakugans?.reduce((acc, bakugan) => acc + bakugan.currentPower, 0)
    const firstBakuganAttribut = bakugans[0].attribut

    return (
        <>

            <div className={`relative z-20 w-full aspect-[3/4] bg-amber-400 p-1 flex`}>
                {
                    bakugans.map((b, index) => <SpritePreview bakugan={b} key={index} />)
                }
                <PowerLevel battleState={battleState} roomId={roomId}  attribut={firstBakuganAttribut} powerLevel={powerLevel} />
            </div>
        </>
    )
}

export function BakuganPreviewOnFocused({ bakugan }: { bakugan: bakuganOnSlot}) {

    return (
        <>

            <div className={`relative z-20 w-full aspect-[3/4] bg-amber-400 p-1 flex`}>
                <SpritePreview bakugan={bakugan} />
                <PowerLevel  attribut={bakugan.attribut} powerLevel={bakugan.currentPower} />
            </div>
        </>
    )
}

export function SpritePreview({ bakugan }: { bakugan: bakuganOnSlot }) {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-10 bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(/images/attributs-background/${bakugan.attribut.toLowerCase()}.png)` }}>


            <div className="relative flex flex-col ">

                <Image src={`/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toLowerCase()}.png`} alt={bakugan.key} width={100} height={100} />

            </div>
        </div>
    )
}

export function PowerLevel({ powerLevel, attribut, battleState, roomId }: { powerLevel: number, attribut: attribut, battleState?: battleState | undefined, roomId?: string }) {

    const socket = useSocket()
    const [power, setPower] = useState(powerLevel)
    const prevPower = useRef(powerLevel)

    useEffect(() => {
        const initial = prevPower.current
        const step = initial < powerLevel ? 5 : -5

        if (initial === powerLevel) return

        const interval = setInterval(() => {
            setPower(prev => {
                const next = prev + step
                if ((step > 0 && next >= powerLevel) || (step < 0 && next <= powerLevel)) {
                    clearInterval(interval)
                    return powerLevel
                }
                return next
            })
        }, 30) // 30ms entre chaque incrément

        prevPower.current = powerLevel

    }, [powerLevel])

    return (
        <div className="absolute bottom-2 right-3 w-[90%] aspect-[7/2]">
            <div className="relative z-10 left-2 w-[25%] aspect-square border-2 border-white rounded-full overflow-hidden p-1" style={{ backgroundImage: `url(/images/attributs-background/${attribut.toUpperCase()}.png)` }}>
                <div className="absolute top-0 left-0 w-full h-full bg-slate-700/50"></div>
                <div className="relative w-full h-full">
                    <Image src={`/images/attributs/${attribut.toUpperCase()}.png`} alt={`ventus`} fill />
                </div>
            </div>
            <div className="absolute top-0 left-1 w-full h-full p-[2px] bg-amber-400" style={{ clipPath: `polygon(100% 0%, 100% 100%, 35% 100%, 30% 80%, 0 80%, 0 0)` }}>

                <div className="overflow-show relative w-full h-full bg-linear-to-b from-emerald-800 to-emerald-500 flex justify-end items-center pr-1" style={{ clipPath: `polygon(100% 0%, 100% 100%, 35% 100%, 30% 80%, 0 80%, 0 0)` }}>
                    <p className={`italic text-right text-2xl md:text-4xl lg:text-5xl ${squareMetal.className}`}>{power}</p>
                </div>
            </div>
        </div>
    )
}