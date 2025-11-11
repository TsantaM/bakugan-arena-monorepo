import * as THREE from 'three'
import gsap from 'gsap'
import { GetSpritePosition } from '../functions/get-sprite-position'
import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'

type MoveBakuganProps = {
  scene: THREE.Scene
  slot: portalSlotsTypeElement
  bakugan: bakuganOnSlot
  userId: string
}

export function MoveBakugan({
  scene,
  bakugan,
  slot,
  userId
}: MoveBakuganProps): Promise<void> {
  return new Promise((resolve) => {
    const newPosition = GetSpritePosition({
      slot,
      userId,
      bakugan,
      slotIndex: Slots.indexOf(slot.id)
    })

    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    if (!bakuganMesh || !newPosition) return resolve()

    const timeline = gsap.timeline({
      onComplete: () => {
        resolve() // ✅ La promesse se résout à la fin du mouvement
      }
    })

    timeline.fromTo(
      bakuganMesh.position,
      {
        x: bakuganMesh.position.x,
        z: bakuganMesh.position.z
      },
      {
        x: newPosition.x,
        z: newPosition.z,
        duration: 0.8,
        ease: 'power2.inOut'
      }
    )
  })
}
