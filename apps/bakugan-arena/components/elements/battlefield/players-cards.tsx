'use client'

import useGetRoomState from "@/src/sockets/get-room-state"
import Image from "next/image"
import TurnInterface from "./turn-interface"
import GameBoard from "./game-board/game-board"


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

export default function PlayerCards({ player, opponent, roomId, userId, turn, set_gate, set_bakugan, use_ability }: { player: player | undefined, opponent: player | undefined, roomId: string, userId: string, turn: boolean, set_gate: boolean, set_bakugan: boolean, use_ability: boolean }) {

    const { roomState } = useGetRoomState({ roomId })
    const userData = roomState?.decksState.find((d) => d.userId === userId)

    const battleState = roomState?.battleState
    const slotOfBattle = roomState?.protalSlots.find((p) => p.id === battleState?.slot)
    const battleConditions = slotOfBattle && battleState && battleState.battleInProcess && battleState.paused === false ? true : false

    return <>

        <div className="relative z-20 w-full h-[75vh] flex justify-between">
            <div className="w-[25vw] md:w-[20vw] lg:w-[15vw] flex flex-col gap-2">
                <div className="relative z-20 w-full aspect-[4/3] bg-amber-400 p-1 rounded-lg">
                    <div className="relative w-full h-full bg-foreground rounded-sm overflow-hidden">
                        {
                            player?.player.image && player!.player.displayUsername ? <Image src={player.player.image} alt={player.player.displayUsername} fill /> : <Image src={'/images/default-profil-picture.png'} alt={''} fill />
                        }
                    </div>
                </div>
                <div className={`relative z-20 w-full aspect-[3/4] bg-amber-400 p-1 rounded-lg ${battleConditions ? `visible` : `hidden`}`}>
                    <div className="relative w-full h-full rounded-sm flex flex-col items-center justify-center gap-10" >
                        {
                            slotOfBattle && <Image src={`/images/attributs-background/${slotOfBattle.bakugans.find((b) => b.userId === userId)?.attribut}.png`} alt={`attribut background ${slotOfBattle.bakugans.find((b) => b.userId === userId)?.attribut}`} fill className="rounded-sm" />
                        }

                        {
                            slotOfBattle && slotOfBattle.bakugans.filter((b) => b.userId === userId).map((b, index) => <div key={index} className="relative flex flex-col">

                                <Image src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} alt={b.key} width={100} height={100} />

                            </div>)
                        }
                        {
                            slotOfBattle && slotOfBattle.bakugans.filter((b) => b.userId === userId).map((b, index) => <div key={index} className="rounded-sm bg-slate-950 absolute bottom-1 left-[50%] translate-x-[-50%] w-[95%] p-3 flex items-center justify-between">
                                <div className="relative size-7">
                                    {
                                        slotOfBattle && <Image src={`/images/attributs/${slotOfBattle.bakugans.find((b) => b.userId === userId)?.attribut}.png`} alt={`attribut background ${slotOfBattle.bakugans.find((b) => b.userId === userId)?.attribut}`} fill className="rounded-sm" />
                                    }
                                </div>
                                <p className="text-center leading-0">{b.currentPower}</p>
                            </div>)
                        }
                    </div>

                </div>
                <TurnInterface turn={turn} set_bakugan={set_bakugan} set_gate={set_gate} use_ability={use_ability} roomId={roomId} battleState={battleState} userId={userId} />
            </div>

            <GameBoard roomId={roomId} userId={userId} />


            <div className="relative z-20 w-[25vw] md:w-[20vw] lg:w-[15vw] self-end md:self-start flex flex-col gap-2">
                <div className="w-full aspect-[4/3] bg-amber-400 p-1 rounded-lg">
                    <div className="relative w-full h-full bg-foreground rounded-sm overflow-hidden">
                        {
                            opponent?.player.image && opponent!.player.displayUsername ? <Image src={opponent.player.image} alt={opponent.player.displayUsername} fill /> : <Image src={'/images/default-profil-picture.png'} alt={''} fill />
                        }
                    </div>
                </div>

                <div className={`w-full aspect-[3/4] bg-amber-400 p-1 rounded-lg ${battleConditions ? `visible` : `hidden`}`}>
                    <div className="relative w-full h-full rounded-sm flex flex-col items-center justify-center gap-10">
                        {
                            slotOfBattle && <Image src={`/images/attributs-background/${slotOfBattle.bakugans.find((b) => b.userId !== userId)?.attribut}.png`} alt={`attribut background ${slotOfBattle.bakugans.find((b) => b.userId !== userId)?.attribut}`} fill className="rounded-sm" />
                        }

                        {
                            slotOfBattle && slotOfBattle.bakugans.filter((b) => b.userId !== userId).map((b, index) => <div key={index} className="relative flex flex-col">

                                <Image src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} alt={b.key} width={100} height={100} />

                            </div>)
                        }
                        {
                            slotOfBattle && slotOfBattle.bakugans.filter((b) => b.userId !== userId).map((b, index) => <div key={index} className="rounded-sm bg-slate-950 absolute bottom-1 left-[50%] translate-x-[-50%] w-[95%] p-3 flex items-center justify-between">
                                <div className="relative size-7">
                                    {
                                        slotOfBattle && <Image src={`/images/attributs/${slotOfBattle.bakugans.find((b) => b.userId !== userId)?.attribut}.png`} alt={`attribut background ${slotOfBattle.bakugans.find((b) => b.userId !== userId)?.attribut}`} fill className="rounded-sm" />
                                    }
                                </div>
                                <p className="text-center">{b.currentPower}</p>
                            </div>)
                        }
                    </div>
                </div>
            </div>

        </div>


    </>


}