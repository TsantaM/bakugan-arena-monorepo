'use client'

import { portalSlotsTypeElement } from "@/src/sockets/get-room-state"
import Image from "next/image"


export default function GateCardOnBoard({ userId, slot }: { userId: string, slot: portalSlotsTypeElement }) {
    
    const playerBakugans = slot.bakugans.filter((b) => b.userId === userId)
    const oponentsBakugans = slot.bakugans.filter((b) => b.userId !== userId)

    return <div className="relative aspect-[2/3] border border-slate-50 flex items-center justify-center text-white text-xs ">

        {
            !slot.can_set && slot.portalCard !== null ?
                <>
                    <Image src={!slot.state.open ? '/images/cards/portal_card.png' : '/images/cards/open-portal-card.png'} alt='gate-card-design' fill />
                    <div className="relative w-full h-full flex flex-col justify-around items-center">
                        <div className="relative flex items-center gap-3">
                            {
                                oponentsBakugans.map((o, index) => 
                                    <div className="relative size-12 lg:size-20" key={index}>
                                        <Image src={`/images/bakugans/sphere/${o.image}/${o.attribut.toUpperCase()}.png`} alt={o.key} fill />
                                    </div>
                                )
                            }
                        </div>

                        <div className="relative flex items-center gap-3">
                            {
                                playerBakugans.map((p, index) => 
                                    <div className="relative size-12 lg:size-20" key={index}>
                                        <Image src={`/images/bakugans/sphere/${p.image}/${p.attribut.toUpperCase()}.png`} alt={p.key} fill />
                                    </div>
                                )
                            }
                        </div>
                    </div>

                </> : <p>{slot.id}</p>
        }



    </div>
}