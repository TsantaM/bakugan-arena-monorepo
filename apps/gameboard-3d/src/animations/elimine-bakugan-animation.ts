import * as THREE from 'three'
import gsap from 'gsap'
import { getAttributColor } from '../functions/get-attrubut-color'
import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'

type ElimineBakuganAnimationProps = {
    bakugan: bakuganOnSlot
    userId: string
    slot: portalSlotsTypeElement
    scene: THREE.Scene,
    bakugansMeshs: THREE.Sprite<THREE.Object3DEventMap>[],
    onCompleteFunction?: () => void
}

export async function ElimineBakuganAnimation({
    bakugan,
    scene,
    slot,
    bakugansMeshs
}: ElimineBakuganAnimationProps): Promise<void> {
    return new Promise((resolve) => {
        const bakuganMesh = scene.getObjectByName(
            `${bakugan.key}-${bakugan.userId}`
        ) as THREE.Sprite<THREE.Object3DEventMap>

        if (!bakuganMesh) return resolve()

        const attributColor = getAttributColor(bakugan.attribut)
        const color = new THREE.Color(attributColor)

        const index = Slots.indexOf(slot.id)
        if (index === -1) return resolve()

        const timeline = gsap.timeline({
            onComplete: () => {
                // 🧹 Nettoyage
                scene.remove(bakuganMesh)
                resolve() // ✅ Résout la promesse à la fin de l’animation
            }
        })

        // Étape 1 : flash de la couleur d’attribut
        timeline.to(bakuganMesh.material.color, {
            r: color.r,
            g: color.g,
            b: color.b,
            duration: 1
        })

        // Étape 2 : disparition graduelle du Bakugan
        timeline.fromTo(
            bakuganMesh.scale,
            { x: 2, y: 2, z: 1 },
            { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.in' }
        )

    bakugansMeshs.forEach((mesh) => {
      if(mesh.name !== bakuganMesh.name) return
      const meshsIndex = bakugansMeshs.findIndex((b) => b.name === mesh.name)
      if (meshsIndex === -1) return
      bakugansMeshs.splice(meshsIndex, 1)
    }) 

    })
}
