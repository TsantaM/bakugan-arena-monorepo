'use client'

import { HybridTooltip, HybridTooltipContent, HybridTooltipProvider, HybridTooltipTrigger } from "@/components/ui/hybrid-tooltip"
import { BBS1Rules, GetDeckDataType, validateDeck } from "@bakugan-arena/game-data"
import { CircleCheck, CircleX } from "lucide-react"

export default function DeckChecker({deck} : {deck: GetDeckDataType}) {

    const Rules = BBS1Rules
    const ckeck = validateDeck(deck, Rules)

    return (

        <>
        
            <HybridTooltipProvider>
                <HybridTooltip>
                    <HybridTooltipTrigger>
                        {
                            ckeck.valid ? <CircleCheck className="text-green-500"/> : <CircleX className="text-red-500"/>
                        }
                    </HybridTooltipTrigger>

                    <HybridTooltipContent>
                        {
                            ckeck.valid ? <p className="text-green-500">Valid deck</p> : <div>
                                <p className="text-red-500">No Valid Deck</p>
                                {
                                    ckeck.reasons.map((r, index) => <p key={index}>{r}</p>)
                                }
                            </div>
                        }
                    </HybridTooltipContent>

                </HybridTooltip>
            </HybridTooltipProvider>

        </>

    )
} 