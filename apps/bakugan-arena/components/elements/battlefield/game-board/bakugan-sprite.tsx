'use client'

import { useFocusedBakugan } from "@/src/store/focused-bakugan-store"
import { bakuganOnSlot } from "@bakugan-arena/game-data"
import Image from "next/image"

export default function BakuganSprite({ bakugan, userId }: { bakugan: bakuganOnSlot, userId: string }) {

    const { reset, setOpponentBakugan, opponentBakugan, setUsersBakugan, usersBakugan } = useFocusedBakugan()

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

    return (
        <div className="relative size-12 lg:size-20" onMouseEnter={setFocusedBakugan} onMouseLeave={resetStore}>
            <Image src={`/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`} alt={bakugan.key} fill />
        </div>
    )
}