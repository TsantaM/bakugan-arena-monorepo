'use client'

import { useGlobalGameState } from '@/src/store/global-game-state-store'
import localFont from 'next/font/local'

const squareMetal = localFont({
    src: [{
        path: "../../../../public/fonts/square_metall-7.ttf"
    }]
})

export default function TurnCounter() {

    const turnState = useGlobalGameState((state) => state.gameState?.turnState)
    const battleState = useGlobalGameState((state) => state.gameState?.battleState)

    return (
        <>
        
        <p className={`${squareMetal.className} self-start relative z-30 text-xl md:text-2xl lg:text-7xl italic text-transparent bg-clip-text bg-linear-to-b from-amber-600 to-amber-400`}>{turnState && turnState.turnCount < 10 ? `0${turnState.turnCount}` : turnState?.turnCount}T {battleState?.battleInProcess && `(${battleState.turns})`}</p>
        
        </>
    )
}