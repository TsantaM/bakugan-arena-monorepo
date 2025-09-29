'use client'

import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { deckType, playerType } from "@bakugan-arena/game-data"

type AliveConterType = {
    userId: string
}

export function AliveCounterLeft({ userId }: AliveConterType) {

    const deck = useGlobalGameState((state) => state.gameState?.decksState.find((d) => d.userId === userId))
    const alive = deck?.bakugans.filter((b) => !b?.bakuganData.elimined)
    const eliminated = deck?.bakugans.filter((b) => b?.bakuganData.elimined)

    return (
        <div className="relative z-30 flex items-center gap-1 md:gap-2 lg:gap-5 self-start">
            {
                alive?.map((a, index) => <AliveCounter key={index} />)
            }
            {
                eliminated?.map((e, index) => <AliveCounter key={index} eliminated />)
            }
        </div>
    )
}

export function AliveCounterRight({ userId }: AliveConterType) {

    const deck = useGlobalGameState((state) => state.gameState?.decksState.find((d) => d.userId !== userId))
    const alive = deck?.bakugans.filter((b) => !b?.bakuganData.elimined)
    const eliminated = deck?.bakugans.filter((b) => b?.bakuganData.elimined)

    return (
        <div className="relative z-30 flex items-center gap-1 md:gap-2 lg:gap-5 self-start">
            {
                eliminated?.map((e, index) => <AliveCounter key={index} eliminated />)
            }
            {
                alive?.map((a, index) => <AliveCounter key={index} />)
            }
        </div>
    )
}

export function AliveCounter({ eliminated }: { eliminated?: boolean }) {
    return (
        <>

            <div className={`size-3 md:size-3 lg:size-7 rounded-full border-2 ${eliminated ? 'border-slate-300' : 'border-amber-900'} bg-linear-to-br ${eliminated ? 'from-slate-900 to-slate-800' : 'from-amber-700 to-amber-500'} `}></div>

        </>
    )
}