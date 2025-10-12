import { Button } from "@/components/ui/button"
import { useGameFinishedAnimation } from "@/src/store/global-animation-timeline-store"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import localFont from "next/font/local"
import Link from "next/link"
import { useEffect, useRef } from "react"

const squareMetal = localFont({
    src: [{
        path: "../../../public/fonts/square_metall-7.ttf"
    }]
})

export default function GameFinishedScreen({ userId }: { userId: string }) {

    const finished = useGlobalGameState((state) => state.gameState?.status.finished)
    const winner = useGlobalGameState((state) => state.gameState?.status.winner)
    const finishedRef = useRef(null)
    const textRef = useRef(null)
    const buttonRef = useRef(null)
    const { add: addGameFinishedAnimation } = useGameFinishedAnimation()

    useGSAP(() => {
        if (finished && finishedRef.current && textRef.current) {
            addGameFinishedAnimation((finishedTimeline) => {
                finishedTimeline.fromTo(finishedRef.current,
                    {
                        display: 'none',
                        opacity: 0
                    },
                    {
                        display: 'block',
                        opacity: 1,
                    }
                )
                finishedTimeline.fromTo(textRef.current,
                    {
                        opacity: 0
                    },
                    {
                        opacity: 1
                    }
                )
                finishedTimeline.fromTo(buttonRef.current, {
                    opacity: 0
                },
                    {
                        opacity: 1
                    })
            })

        }
    }, [finished])

    if (finished) {
        return (
            <div ref={finishedRef} className='absolute z-30 top-0 left-0 w-full h-full bg-slate-900/50'>
                <div className="absolute z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center justify-center gap-5">
                    <p ref={textRef} className={`text-9xl text-center uppercase italic text-transparent bg-clip-text bg-linear-to-b from-amber-600 to-amber-400 ${squareMetal.className}`}>{winner !== null ? winner === userId ? `You Win` : `You Lose` : `Equality`}</p>

                    <Button asChild ref={buttonRef}><Link href='/dashboard'>Return to Lobby</Link></Button>
                </div>
            </div >
        )
    }

}