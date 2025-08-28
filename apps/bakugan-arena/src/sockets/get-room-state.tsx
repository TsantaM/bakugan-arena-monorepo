'use client'

import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";
import { attribut } from "@bakugan-arena/game-data";

type slots_id = "slot-1" | "slot-2" | "slot-3" | "slot-4" | "slot-5" | "slot-6"

type portalSlotsType = {
    id: slots_id,
    portalCard: {
        key: string,
        userId: string
    } | null,
    bakugans: {
        key: string,
        userId: string,
        powerLevel: number,
        currentPower: number,
        attribut: attribut
    }[],
    state: {
        open: boolean,
        canceled: boolean
    }
}[]

export type stateType = {
    roomId: string;
    decksState: {
        deckId: string;
        userId: string;
        bakugans: ({
            bakuganData: {
                key: string;
                name: string;
                attribut: attribut;
                image: string;
                powerLevel: number;
                currentPowerLevel: number;
                elimined: boolean;
                onDomain: boolean;
                gateCard: undefined;
            };
            excluAbilitiesState: {
                key: string;
                name: string;
                description: string;
                usable: boolean;
                used: boolean;
                dead: boolean;
            }[];
        } | undefined)[];
        abilities: {
            key: string;
            name: string;
            attribut: attribut;
            description: string;
            usable: boolean;
            used: boolean;
            dead: boolean;
        }[];
        gates: {
            key: string;
            name: string;
            attribut: attribut | undefined;
            description: string;
            set: boolean;
            usable: boolean;
            dead: boolean;
        }[];
    }[];
    protalSlots: portalSlotsType;
} | undefined


export default function useGetRoomState({roomId}: {roomId: string}) {
    const socket = useSocket()
    const [roomState, setRoomState] = useState<stateType | undefined>()


    useEffect(() => {
        if (socket) {
            socket.emit('get-room-state', ({ roomId }))
            socket.on('room-state', (state: stateType) => {
                console.log(state)
                setRoomState(state)
            })
        }
    }, [socket, roomId])

    return {
        roomState,
    }
}