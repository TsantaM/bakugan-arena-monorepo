import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests"
import { SelectGateCard } from "./turn-actions-resolution/select-gate-card"
import { SelectBakugan } from "./turn-actions-resolution/select-bakugan"
import { SelectAbilityCard } from "./turn-actions-resolution/select-ability-card"
import { SetGateCard } from "./turn-actions-resolution/set-gate-card"
import * as THREE from 'three'
import { SetBakugan } from "./turn-actions-resolution/set-bakugan-action"
import type { Socket } from "socket.io-client"

export function TurnActionResolution({ SelectedActions, userId, actions, camera, plane, roomId, socket }: {
    SelectedActions: ActionRequestAnswerType, userId: string, actions: ActionType[], camera: THREE.PerspectiveCamera,
    scene: THREE.Scene<THREE.Object3DEventMap>, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>, roomId: string, socket: Socket
}) {
    SelectGateCard({ SelectedActions: SelectedActions, userId: userId, actions: actions })
    SelectBakugan({ SelectedActions: SelectedActions, userId: userId, actions: actions })
    SelectAbilityCard({ SelectedActions: SelectedActions, userId: userId, actions: actions })

    SetGateCard({ SelectedActions: SelectedActions, userId: userId, actions: actions, camera: camera, plane: plane, roomId: roomId, socket: socket })
    SetBakugan({ SelectedActions: SelectedActions, actions: actions, userId: userId, camera: camera, plane: plane, roomId: roomId, socket: socket })
}