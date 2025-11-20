'use client'

import TurnInterface from "./turn-interface"
// import TurnCounter from "./game-board/turn-counter"
// import { ProfilePictureLeft, ProfilePictureRigth } from "./game-board/profile-picture-zone"
// import { BakuganPreviewOnFocused, BattleBakuganPreview } from "./game-board/bakugan-preview"
// import { AliveCounterLeft, AliveCounterRight } from "./game-board/alive-counter"
import { useFocusedBakugan } from "@/src/store/focused-bakugan-store"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useRef } from "react"
import { useSocket } from "@/src/providers/socket-provider"
// import { useAnimationStore } from "@/src/store/animations-store"


export type player = {
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
}

export default function PlayerCards({ player, opponent, roomId, userId }: { player: player | undefined, opponent: player | undefined, roomId: string, userId: string }) {

    const socket = useSocket()
    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)
    const battleState = useGlobalGameState((state) => state.gameState?.battleState)

    // const { usersBakugan, opponentBakugan } = useFocusedBakugan()
    const playerData = player?.player
    const opponentData = opponent?.player

    const slotOfBattle = slots?.find((p) => p.id === battleState?.slot)
    const battleConditions = slotOfBattle && battleState && battleState.battleInProcess && battleState.paused === false ? true : false
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const link = `http://localhost:5173/?roomId=${roomId}&userId=${userId}&userImage=${playerData?.image ? playerData?.image : undefined}&opponentImage=${opponentData?.image ? opponentData?.image : undefined}`



    return <>
        <div className="relative z-20 w-full h-[85vh] flex justify-between">
            {/* <div className="relative z-50 w-[25vw] md:w-[20vw] lg:w-[15vw] flex flex-col gap-2">
                {
                    playerData && <ProfilePictureLeft player={playerData} />
                }
                {
                    !usersBakugan && !opponentBakugan && battleConditions && slotOfBattle && player && <BattleBakuganPreview battleState={battleState} roomId={roomId} slot={slotOfBattle} userId={player?.player.id} />
                }
                {
                    usersBakugan && <BakuganPreviewOnFocused bakugan={usersBakugan} />
                }

            </div> */}

            {/* <AliveCounterLeft userId={userId} />
            <TurnCounter />
            <AliveCounterRight userId={userId} /> */}

            <iframe ref={iframeRef} src={link} className="w-full h-full absolute top-0 left-0"></iframe>

            {/* <div className="relative z-50 w-[25vw] md:w-[20vw] lg:w-[15vw] self-start flex flex-col gap-2">
                {
                    opponentData && <ProfilePictureRigth player={opponentData} />
                }
                {
                    !opponentBakugan && !usersBakugan && battleConditions && slotOfBattle && opponent && <BattleBakuganPreview battleState={battleState} roomId={roomId} slot={slotOfBattle} userId={opponent?.player.id} />
                }
                {
                    opponentBakugan && <BakuganPreviewOnFocused bakugan={opponentBakugan} />
                }
            </div> */}

        </div>
        <TurnInterface roomId={roomId} userId={userId} />


    </>


}