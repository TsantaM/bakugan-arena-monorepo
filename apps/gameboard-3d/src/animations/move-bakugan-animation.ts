import * as THREE from 'three'
import gsap from 'gsap'
import { GetSpritePosition } from '../functions/get-sprite-position'
import { Slots, type bakuganOnSlot, type portalSlotsTypeElement } from '@bakugan-arena/game-data'
import type { SpriteUserData } from '../meshes/bakugan.mesh'

type MoveBakuganProps = {
  scene: THREE.Scene
  slot: portalSlotsTypeElement
  bakugan: bakuganOnSlot
  userId: string,
  duration?: number
}

export function MoveBakugan({
  scene,
  bakugan,
  slot,
  userId,
  duration= 0.8
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

    const userData: SpriteUserData = {
      attribut: bakugan.attribut,
      bakuganKey: bakugan.key,
      image: bakugan.image,
      powerLevel: bakugan.currentPower,
      slot: bakugan.slot_id,
      userId: bakugan.userId
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        bakuganMesh.userData = userData
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
        duration: duration,
        ease: 'power2.inOut'
      }
    )
  })
}
