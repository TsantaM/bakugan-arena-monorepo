import * as THREE from 'three'
import gsap from 'gsap'
import type { portalSlotsTypeElement } from '@bakugan-arena/game-data'

function CancelGateCardAnimation({
  slot,
  mesh
}: {
  slot: portalSlotsTypeElement
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>
}): Promise<void> {
  return new Promise((resolve) => {
    // Vérifications de sécurité
    if (slot.portalCard === null) return resolve()
    if (slot.state.open === false) return resolve()
    if (!mesh) return resolve()

    // === Timeline GSAP ===
    const timeline = gsap.timeline({
      onComplete: () => {
        resolve() // ✅ animation terminée
      }
    })

    timeline.fromTo(
      mesh.material.color,
      { r: 1, g: 1, b: 1 },
      {
        r: 0.1,
        g: 0.1,
        b: 0.1,
        duration: 0.5,
        ease: 'power1.inOut',
        onComplete: () => {
          mesh.userData.isCanceled = true
        }
      }
    )
  })
}

export { CancelGateCardAnimation }
