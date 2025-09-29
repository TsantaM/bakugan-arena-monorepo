'use client'

import { playersType } from "@bakugan-arena/game-data"
import Image from "next/image"

type ProfilePictureType = {
    player: playersType
}

export function ProfilePictureLeft({ player }: ProfilePictureType) {
    return (<>
        <div className="relative z-20 w-full aspect-[4/3] bg-linear-to-b from-amber-900 to-amber-400 p-1" style={{ clipPath: `polygon(100% 0%, 100% 100%, 45% 100%, 35% 90%, 0 90%, 0 0)` }}>
            <div className="relative w-full h-[85%] bg-foreground overflow-hidden">
                {
                    player.image ? <Image src={player.image} alt={player.displayUsername ? player.displayUsername : ''} fill /> : <Image src='/images/default-profil-picture.png' alt={'Default Profile Picture'} fill />
                }
            </div>
        </div>
    </>)
}

export function ProfilePictureRigth({ player }: ProfilePictureType) {
    return (<>
        <div className="relative z-20 w-full aspect-[4/3] bg-linear-to-b from-amber-900 to-amber-400 p-1" style={{ clipPath: `polygon(100% 0%, 100% 90%, 65% 90%, 55% 100%, 0 100%, 0 0)` }}>
            <div className="relative w-full h-[85%] bg-foreground overflow-hidden">
                {
                    player.image ? <Image src={player.image} alt={player.displayUsername ? player.displayUsername : ''} fill /> : <Image src='/images/default-profil-picture.png' alt={'Default Profile Picture'} fill />
                }
            </div>
        </div>
    </>)
}