'use client'

import { useRef } from "react"

type player = {
    player: {
        id: string;
        image: string | null;
        displayUsername: string | null;
    };
    deck: {
        bakugans: string[];
        ability: string[];
        exclusiveAbilities: string[];
        gateCards: string[];
    };
} | undefined

type BattleFieldPageProps = {
    player: player,
    opponent: player,
    roomId: string,
    userId: string
}


export default function BattleFieldPage({ player, opponent, roomId, userId }: BattleFieldPageProps) {

    const playerData = player?.player
    const opponentData = opponent?.player
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const link = `${GAMEBOARD_URL}/?roomId=${roomId}&userId=${userId}&userImage=${playerData?.image ? playerData?.image : undefined}&opponentImage=${opponentData?.image ? opponentData?.image : undefined}`

    return (
        <>
            <iframe ref={iframeRef} src={link} className="w-full h-full border-0"></iframe>
        </>
    )
}