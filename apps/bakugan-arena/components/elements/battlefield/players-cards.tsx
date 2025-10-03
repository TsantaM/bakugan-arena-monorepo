'use client'

import TurnInterface from "./turn-interface"
import GameBoard from "./game-board/game-board"
import TurnCounter from "./game-board/turn-counter"
import { ProfilePictureLeft, ProfilePictureRigth } from "./game-board/profile-picture-zone"
import { BakuganPreviewOnFocused, BattleBakuganPreview } from "./game-board/bakugan-preview"
import { AliveCounterLeft, AliveCounterRight } from "./game-board/alive-counter"
import { useFocusedBakugan } from "@/src/store/focused-bakugan-store"
import { useGlobalGameState } from "@/src/store/global-game-state-store"


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

export default function PlayerCards({ player, opponent, roomId, userId, turn, set_bakugan, use_ability }: { player: player | undefined, opponent: player | undefined, roomId: string, userId: string, turn: boolean, set_bakugan: boolean, use_ability: boolean }) {

    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)
    const battleState = useGlobalGameState((state) => state.gameState?.battleState)

    const { usersBakugan, opponentBakugan } = useFocusedBakugan()
    const playerData = player?.player
    const opponentData = opponent?.player

    const slotOfBattle = slots?.find((p) => p.id === battleState?.slot)
    const battleConditions = slotOfBattle && battleState && battleState.battleInProcess && battleState.paused === false ? true : false


    return <>
        <div className="relative z-20 w-full h-[75vh] flex justify-between">
            <div className="relative z-50 w-[25vw] md:w-[20vw] lg:w-[15vw] flex flex-col gap-2">
                {
                    playerData && <ProfilePictureLeft player={playerData} />
                }
                {
                    !usersBakugan && !opponentBakugan && battleConditions && slotOfBattle && player && <BattleBakuganPreview battleState={battleState} roomId={roomId} slot={slotOfBattle} userId={player?.player.id} />
                }
                {
                    usersBakugan && <BakuganPreviewOnFocused bakugan={usersBakugan} />
                }

            </div>

            <AliveCounterLeft userId={userId} />
            <TurnCounter />
            <AliveCounterRight userId={userId} />

            <GameBoard userId={userId} />

            <div className="relative z-50 w-[25vw] md:w-[20vw] lg:w-[15vw] self-start flex flex-col gap-2">
                {
                    opponentData && <ProfilePictureRigth player={opponentData} />
                }
                {
                    !opponentBakugan && !usersBakugan && battleConditions && slotOfBattle && opponent && <BattleBakuganPreview battleState={battleState} roomId={roomId} slot={slotOfBattle} userId={opponent?.player.id} />
                }
                {
                    opponentBakugan && <BakuganPreviewOnFocused bakugan={opponentBakugan} />
                }
            </div>

        </div>
        <TurnInterface turn={turn} set_bakugan={set_bakugan} use_ability={use_ability} roomId={roomId} battleState={battleState} userId={userId} />


    </>


}