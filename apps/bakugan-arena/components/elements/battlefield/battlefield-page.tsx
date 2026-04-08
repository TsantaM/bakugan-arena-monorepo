'use client'

import { useSocketStore } from "@/src/store/socket-id-store";
import ReactHowler from 'react-howler'
import { useEffect, useRef } from "react"
import MessagesModal from "./messages-modal";
import { redirect } from "next/navigation";
import { useAudioStore } from "@/src/store/sounds-store";
import { OSTLists } from "@/src/variables/OST";
import { Toaster } from "@/components/ui/sonner"

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
    userId: string,
    isPlayer: boolean
}


export default function BattleFieldPage({ player, opponent, roomId, userId, isPlayer }: BattleFieldPageProps) {

    const socket = useSocketStore((state) => state.socket)

    if (!socket) return null
    const socketId = socket.id

    if (socketId === undefined) {
        redirect('/dashboard')
    }

    const playRandomOST = () => {
        const randomIndex = Math.floor(Math.random() * OSTLists.length)
        const randomTrack = OSTLists[randomIndex]

        useAudioStore.getState().setTrack(randomTrack.src)
    }

    const { volume, track } = useAudioStore()
    const playerData = player?.player
    const opponentData = opponent?.player
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const playerLink = `${GAMEBOARD_URL}/?roomId=${roomId}&userId=${userId}&parentSocket=${socketId}&userImage=${playerData?.image ? playerData?.image : undefined}&opponentImage=${opponentData?.image ? opponentData?.image : undefined}`

    const viewerLink = `${GAMEBOARD_URL}/viewer.html/?roomId=${roomId}&userId=${userId}&parentSocket=${socketId}&player1Id=${playerData?.id}&player1Image=${playerData?.image ?? undefined}&player2Id=${opponentData?.id}&player2Image=${opponentData?.image ?? undefined}`

    const link = isPlayer ? playerLink : viewerLink
    console.log(link)

    useEffect(() => {
        playRandomOST()
    }, [])
    //     const handleMessage = (event: MessageEvent) => {
    //         // 🔒 sécurité (IMPORTANT en prod)
    //         if (!event.data || event.data.type !== "GAME_MESSAGE") return;

    //         const messages: Message[] = event.data.payload;

    //         console.log("Message reçu de l'iframe :", messages);

    //         const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    //         async function showToasts(messages: Message[]) {
    //             for (const message of messages) {
    //                 if(message.description) continue
    //                 const text = message.userName ? `${message.userName} : ${message.text}` : message.text
    //                 toast.info(text)
    //                 await delay(500); // Attendre 3 secondes avant d'afficher le message suivant
    //             }
    //         }

    //         showToasts(messages)

    //         // 👉 ici tu peux déclencher ton UI
    //         // exemple: envoyer au store ou au modal
    //         // handleIncomingMessage(message);
    //     };

    //     window.addEventListener("message", handleMessage);

    //     return () => {
    //         window.removeEventListener("message", handleMessage);
    //     };
    // }, []);

    return (
        <>
            <ReactHowler
                src={[`/sounds/OST/${track}`]}
                loop={true}
                volume={volume[0]}
                playing={true}
            />
            <MessagesModal player={playerData?.displayUsername} opponent={opponentData?.displayUsername} roomId={roomId} userId={userId} />
            <iframe ref={iframeRef} src={link} className="w-full h-full border-0"></iframe>
            <Toaster  />

        </>
    )
}