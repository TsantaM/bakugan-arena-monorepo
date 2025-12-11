import { Slots, type bakuganOnSlot, type portalSlotsType } from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { createSlotMesh } from '../meshes/slot.mesh'
import { createSprite } from '../meshes/bakugan.mesh'
import { OnBattleStartFunctionAnimation } from '../scene-modifications-functions/on-battle-start-function-animation'
import { SetBakuganAndAddRenfortAnimationAndFunction } from '../scene-modifications-functions/add-renfort-function-animation'

export function InitTestBattleField({ scene, plane, userId, slots }: { scene: THREE.Scene<THREE.Object3DEventMap>, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, userId: string, slots: portalSlotsType }) {


    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]
        if (slot.portalCard !== null) {
            createSlotMesh({
                plane: plane,
                slot: slot
            })

            if (slot.bakugans.length > 0) {
                for (let b = 0; b < slot.bakugans.length; b++) {
                    const bakugan = slot.bakugans[b]
                    createSprite({
                        bakugan: bakugan,
                        scene: scene,
                        slot: slot,
                        slotIndex: Slots.indexOf(bakugan.slot_id),
                        userId: userId
                    })
                }
            }
        }

    }

    const slotOfBattle = slots[0]

    OnBattleStartFunctionAnimation({
        slot: structuredClone(slotOfBattle),
        userId: userId
    })


}

export function AddBakugan({ scene, userId, camera, slots }: { scene: THREE.Scene<THREE.Object3DEventMap>, userId: string, camera: THREE.PerspectiveCamera, slots: portalSlotsType }) {
    const newBakugan: bakuganOnSlot = {
        id: 4,
        abilityBlock: false,
        assist: false,
        attribut: 'Darkus',
        currentPower: 500,
        family: 'exedra',
        image: 'exedra',
        key: 'exedra-darkus',
        powerLevel: 500,
        slot_id: 'slot-2',
        userId: 'user-2'
    }

    slots[0].bakugans.push(newBakugan)

    SetBakuganAndAddRenfortAnimationAndFunction({
        bakugan: newBakugan,
        camera: camera,
        scene: scene,
        slot: slots[0],
        userId: userId
    })
}