import * as THREE from 'three'
import gsap from 'gsap'

function RemoveGateCardAnimation({
  mesh,
  gateCardMeshs
}: {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>,
  gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
}): Promise<void> {
  return new Promise((resolve) => {
    const color = new THREE.Color('white')
    mesh.material.map = null

    const timeline = gsap.timeline({
      onComplete: () => {
        mesh.removeFromParent()
        resolve() // ✅ l’animation est terminée, on résout la promesse
      },
    })

    // Phase 1 : légère émission blanche
    timeline.to(mesh.material.emissive, {
      r: color.r,
      g: color.g,
      b: color.b,
      duration: 0.3,
    })

    // Phase 2 : fondu de la couleur du matériau
    timeline.fromTo(
      mesh.material.color,
      { r: 1, g: 1, b: 1 },
      { r: 0, g: 0, b: 0, duration: 0.5 }
    )

    // Phase 3 : extinction finale
    timeline.to(mesh.material.emissive, {
      r: 0,
      g: 0,
      b: 0,
      duration: 0.3,
    })

    const index = gateCardMeshs.findIndex((card) => card === mesh)
    if(index === -1) return
    gateCardMeshs.splice(index, 1)

  })
}

export { RemoveGateCardAnimation }
