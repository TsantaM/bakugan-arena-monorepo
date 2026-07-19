import type { replaySnapshotType } from "@bakugan-arena/game-data"
import { replaySnapshotToRoomState, resolveEliminatedForPerspective } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { InitGameState } from "./init-game-state"
import { applyReplaySnapshotUi } from "./apply-replay-snapshot-ui"

type ApplyReplayBoardStateProps = {
    snapshot: replaySnapshotType
    perspectiveUserId: string
    scene: THREE.Scene
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[]
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
    keepObjects: THREE.Object3D[]
}

function clearActiveAbilityOverlays() {
    document.querySelectorAll(".active-ability-image").forEach((element) => {
        gsap.killTweensOf(element)
        element.querySelectorAll(".overlay, .overlay2, .active-ability-image-img").forEach((child) => {
            gsap.killTweensOf(child)
        })
        element.remove()
    })
}

export function applyReplayBoardState({
    snapshot,
    perspectiveUserId,
    scene,
    plane,
    bakugansMeshs,
    gateCardMeshs,
    keepObjects,
}: ApplyReplayBoardStateProps) {
    const keep = new Set(keepObjects)

    ;[...scene.children].forEach((child) => {
        if (!keep.has(child)) scene.remove(child)
    })

    plane.clear()
    bakugansMeshs.length = 0
    gateCardMeshs.length = 0

    document.getElementById("left-bakugan-previews-container")?.remove()
    document.getElementById("right-bakugan-previews-container")?.remove()
    clearActiveAbilityOverlays()

    const remappedSnapshot: replaySnapshotType = {
        ...snapshot,
        eliminated: resolveEliminatedForPerspective(snapshot.decksState, perspectiveUserId),
    }

    applyReplaySnapshotUi(remappedSnapshot, perspectiveUserId)
    InitGameState({
        state: replaySnapshotToRoomState(remappedSnapshot),
        bakugansMeshs,
        gateCardMeshs,
        plane,
        scene,
        userId: perspectiveUserId,
        // Même comportement visuel que main.ts (joueur, pas spectateur)
        isSpectator: false,
    })
}
