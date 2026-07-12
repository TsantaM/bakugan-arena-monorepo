'use client'

import { useEffect, useRef, useState } from "react"
import ImportReplay from "./import-replay-input"
import { replayDataType } from "@bakugan-arena/game-data"
import SelectUploadedReplay from "./select-uploaded-replay"
import ReactHowler from "react-howler"
import { useAudioStore } from "@/src/store/sounds-store"
import MessagesModal from "../battlefield/messages-modal"

export default function ReplayPage() {

    const [replay, setReplay] = useState<replayDataType | null>(null)
    const { volume, track } = useAudioStore()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL

    useEffect(() => {
        if (!replay) return

        const iframe = iframeRef.current
        if (!iframe) return

        const sendReplay = () => {
            iframe.contentWindow?.postMessage(
                {
                    type: "LOAD_REPLAY",
                    payload: replay,
                },
                GAMEBOARD_URL ?? "*"
            )
        }

        iframe.addEventListener("load", sendReplay)
        sendReplay()

        return () => {
            iframe.removeEventListener("load", sendReplay)
        }
    }, [replay, GAMEBOARD_URL])

    const link = `${GAMEBOARD_URL}/replay.html/?roomId=${replay?.roomId}&player1Id=${replay?.player1?.id}&player1Image=${replay?.player1?.image ?? undefined}&player2Id=${replay?.player2?.id}&player2Image=${replay?.player2?.image ?? undefined}`


    return (<>
        <header className="flex items-center justify-center gap-4">
            <ImportReplay
                setReplay={(replayData: replayDataType) => {
                    setReplay(replayData)
                }}
            />
            <SelectUploadedReplay
                setReplay={(replayData: replayDataType) => {
                    setReplay(replayData)
                }}
            />
        </header>

        {
            replay && replay.player1 && replay.player2 && <>

                <ReactHowler
                    src={[`/sounds/OST/${track}`]}
                    loop={true}
                    volume={volume[0]}
                    playing={true}
                />
                <iframe ref={iframeRef} src={link} className="w-full h-full border-0"></iframe>
                <MessagesModal player={replay.player1.displayUsername} opponent={replay.player2.displayUsername} roomId={replay.roomId} userId={replay.player1.id} />

            </>
        }

    </>)
}
