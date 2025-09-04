'use client'

import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";
import { attribut } from "@bakugan-arena/game-data";

type slots_id = "slot-1" | "slot-2" | "slot-3" | "slot-4" | "slot-5" | "slot-6"

export type portalSlotsTypeElement = {
    id: slots_id,
    can_set: boolean,
    portalCard: {
        key: string,
        userId: string
    } | null,
    bakugans: {
        key: string,
        userId: string,
        powerLevel: number,
        currentPower: number,
        attribut: attribut,
        image: string
    }[],
    state: {
        open: boolean,
        canceled: boolean
    }
}

type portalSlotsType = {
    id: slots_id,
    can_set: boolean,
    portalCard: {
        key: string,
        userId: string
    } | null,
    bakugans: {
        key: string,
        userId: string,
        powerLevel: number,
        currentPower: number,
        attribut: attribut,
        image: string
    }[],
    state: {
        open: boolean,
        canceled: boolean
    }
}[]

export type stateType = {
    roomId: string;
    turnState: {
        turn: string;
        turnCount: number;
        set_new_gate: boolean;
        set_new_bakugan: boolean;
        use_ability_card: boolean;
    }
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


export default function useGetRoomState({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const [roomState, setRoomState] = useState<stateType | undefined>()
    const [slots, setSlots] = useState<portalSlotsType>()

    const getRoomData = () => {
        if (socket) {
            socket.emit('get-room-state', ({ roomId }))
            socket.on('room-state', (state: stateType) => {
                console.log(state)
                setRoomState(state)
                setSlots(state?.protalSlots)
            })
        }
    }

    useEffect(() => {
        if (socket) {
            socket.emit('get-room-state', ({ roomId }))
            socket.on('room-state', (state: stateType) => {
                console.log(state)
                setRoomState(state)
                setSlots(state?.protalSlots)
            })
        }
    }, [socket, roomId])

    return {
        roomState,
        setRoomState,
        slots,
        setSlots,
        getRoomData
    }
}