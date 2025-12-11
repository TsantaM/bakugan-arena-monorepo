import type { ActionRequestAnswerType, ActionType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests"
import { SelectGateCard } from "./turn-actions-resolution/select-gate-card"
import { SelectBakugan } from "./turn-actions-resolution/select-bakugan"
import { SelectAbilityCard } from "./turn-actions-resolution/select-ability-card"
import { SetGateCard } from "./turn-actions-resolution/set-gate-card"
import * as THREE from 'three'

export function TurnActionResolution({ SelectedActions, userId, actions, camera, scene, plane }: {
    SelectedActions: ActionRequestAnswerType, userId: string, actions: ActionType[], camera: THREE.PerspectiveCamera,
    scene: THREE.Scene<THREE.Object3DEventMap>, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
}) {
    SelectGateCard({ SelectedActions: SelectedActions, userId: userId, actions: actions })
    SelectBakugan({ SelectedActions: SelectedActions, userId: userId, actions: actions })
    SelectAbilityCard({ SelectedActions: SelectedActions, userId: userId, actions: actions })

    SetGateCard({ SelectedActions: SelectedActions, userId: userId, actions: actions, camera: camera, scene: scene, plane: plane })
}