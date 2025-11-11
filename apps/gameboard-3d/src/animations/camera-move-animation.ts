import * as THREE from 'three'
import gsap from 'gsap'

function MoveCamera({
  camera,
  newPosition
}: {
  camera: THREE.PerspectiveCamera
  newPosition: THREE.Vector3
}): Promise<void> {
  return new Promise((resolve) => {
    const currentPosition = camera.position

    const timeline = gsap.timeline({
      onComplete: () => {
        resolve() // ✅ La caméra a terminé son mouvement
      }
    })

    timeline.fromTo(
      camera.position,
      {
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z
      },
      {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        duration: 1,
        ease: 'power1.inOut'
      }
    )
  })
}

export { MoveCamera }
