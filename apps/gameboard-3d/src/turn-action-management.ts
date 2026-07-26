import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
} from '@bakugan-arena/game-data'
import * as THREE from 'three'
import type { Socket } from 'socket.io-client'
import { handleTurnActionRequest } from './turn-action-management/turn-action-bridge'

/**
 * Entrée live du tour : forward vers Next + écoute ciblage/commit.
 * L'UI de sélection bakugan/cartes vit désormais dans bakugan-arena.
 */
export function TurnActionBuilder({
    request,
    userId,
    camera,
    scene,
    plane,
    roomId,
    socket,
}: {
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType
    userId: string
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    roomId: string
    socket: Socket
}) {
    handleTurnActionRequest(request, {
        socket,
        userId,
        roomId,
        camera,
        scene,
        plane,
    })
}
