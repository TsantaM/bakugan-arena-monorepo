import * as THREE from 'three'
import gsap from 'gsap'
import type { portalSlotsTypeElement } from '@bakugan-arena/game-data'

async function CancelGateCardAnimation({
  mesh
}: {
  slot: portalSlotsTypeElement
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>
}): Promise<void> {
  return new Promise((resolve) => {
    if (!mesh?.material) return resolve()

    // Ne pas bloquer si l'état serveur a déjà été marqué canceled/open
    // avant le rendu : la directive a déjà validé l'effet côté game-data.
    const material = mesh.material as THREE.MeshStandardMaterial
    if (!material.color) return resolve()

    gsap.killTweensOf(material.color)

    const timeline = gsap.timeline({
      onComplete: () => resolve(),
    })

    timeline.fromTo(
      material.color,
      { r: 1, g: 1, b: 1 },
      {
        r: 0.1,
        g: 0.1,
        b: 0.1,
        duration: 0.5,
        ease: 'power1.inOut',
        onComplete: () => {
          if (mesh.userData?.state) {
            mesh.userData.state.canceled = true
          }
        },
      }
    )
  })
}

export { CancelGateCardAnimation }
