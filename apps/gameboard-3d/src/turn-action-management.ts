import type { ActionRequestAnswerType, ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { TurnActionInterfaceBuilder } from "./turn-action-management/turn-interface-builder";
import { TurnActionResolution } from "./turn-action-management/turn-action-resolution";
import * as THREE from 'three'
import type { Socket } from "socket.io-client";

export function TurnActionBuilder({ request, userId, camera, scene, plane, roomId, socket }: {
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType, userId: string, camera: THREE.PerspectiveCamera,
    scene: THREE.Scene<THREE.Object3DEventMap>, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>, roomId: string, socket: Socket
}) {

    let SelectedActions: ActionRequestAnswerType = [
        {
            type: 'SELECT_GATE_CARD',
            data: undefined
        },
        {
            type: 'SELECT_BAKUGAN',
            data: undefined
        },
        {
            type: 'SELECT_ABILITY_CARD',
            data: undefined
        },
        {
            type: 'SET_BAKUGAN',
            data: undefined
        },
        {
            type: 'SET_GATE_CARD_ACTION',
            data: undefined
        },
        {
            type: "USE_ABILITY_CARD",
            data: undefined
        },
        {
            type: 'ACTIVE_GATE_CARD',
            data: undefined
        }
    ]

    SelectedActions.forEach((action) => {
        if (action.data !== undefined)
            action.data = undefined
    })

    const actions = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat();

    TurnActionInterfaceBuilder({ request: request })
    
    TurnActionResolution({
        socket: socket,
        SelectedActions: SelectedActions,
        userId: userId,
        actions: actions,
        camera: camera,
        scene: scene,
        plane: plane,
        roomId: roomId,
        request: request
    })
}