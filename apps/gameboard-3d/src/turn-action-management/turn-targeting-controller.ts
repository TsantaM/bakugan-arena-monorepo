import type {
    AdditionalPartialSelection,
    AdditionalTargetResult,
    bakuganToMoveType2,
    slots_id,
    TurnActionCommitPayload,
    TurnActionPartialSelection,
} from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { createOverableSlot } from './turn-actions-function/create-overable-slot'
import { SelectBakuganOnMouseMove } from './turn-actions-function/select-bakugan-on-mouse-move'
import {
    notifyParentActionTargetCancelled,
    notifyParentActionTargetSelected,
    notifyParentAdditionalTargetSelected,
} from '../functions/send-message-to-parent'
import type { SpriteUserData } from '../meshes/bakugan.mesh'
import {
    clearSelectableHighlights,
    highlightSelectableBakugans,
    highlightSelectableSlots,
    setSlotHoverEmphasis,
} from './selectable-highlights'
import { getAttributColor } from '../functions/get-attrubut-color'

type TargetingContext = {
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    userId: string
}

let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
let clickHandler: ((e: MouseEvent) => void) | null = null
let pointerDownHandler: ((e: PointerEvent) => void) | null = null
let activeSlots: slots_id[] = []
let dimmedBakuganNames: string[] = []
let pointerDownPos: { x: number; y: number } | null = null

function resetSlotsColor(plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>, slots: slots_id[]) {
    slots.forEach((slot) => {
        const mesh = plane.getObjectByName(slot) as THREE.Mesh<
            THREE.PlaneGeometry,
            THREE.MeshBasicMaterial
        > | undefined
        if (!mesh) return
        if (mesh.userData?.state?.canceled === true) {
            mesh.material.color.set(0.1, 0.1, 0.1)
        } else {
            mesh.material.color.set('white')
        }
    })
}

function removeOverableSlots(
    plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
    slots: slots_id[],
) {
    slots.forEach((slot) => {
        const children = [...plane.children]
        children.forEach((child) => {
            if (
                child.name === slot &&
                child.userData?.classes?.includes('overable')
            ) {
                plane.remove(child)
            }
        })
    })
}

function restoreBakuganOpacity(scene: THREE.Scene, names: string[]) {
    names.forEach((name) => {
        const mesh = scene.getObjectByName(name) as THREE.Sprite | undefined
        if (!mesh?.material) return
        const mat = mesh.material as THREE.SpriteMaterial
        mat.opacity = 1
        mat.color.set('white')
    })
}

function detachListeners() {
    if (mouseMoveHandler) {
        window.removeEventListener('mousemove', mouseMoveHandler)
        window.removeEventListener('pointermove', mouseMoveHandler)
        mouseMoveHandler = null
    }
    if (clickHandler) {
        window.removeEventListener('click', clickHandler)
        window.removeEventListener('pointerup', clickHandler)
        clickHandler = null
    }
    if (pointerDownHandler) {
        window.removeEventListener('pointerdown', pointerDownHandler)
        pointerDownHandler = null
    }
    pointerDownPos = null
}

function resolveSlotIdFromObject(obj: THREE.Object3D, slots: slots_id[]): slots_id | null {
    let current: THREE.Object3D | null = obj
    while (current) {
        if (slots.includes(current.name as slots_id)) {
            return current.name as slots_id
        }
        const fromData = current.userData?.slotId as slots_id | undefined
        if (fromData && slots.includes(fromData)) {
            return fromData
        }
        current = current.parent
    }
    return null
}

/** Raycast robuste : ignore les bordures, résout overlay / mesh permanent. */
function pickSlotByRaycast(
    event: MouseEvent | PointerEvent,
    camera: THREE.PerspectiveCamera,
    plane: THREE.Mesh,
    slots: slots_id[],
): THREE.Mesh | null {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
    )
    raycaster.setFromCamera(mouse, camera)

    const targets = plane.children.filter((c) => {
        if (c.userData?.classes?.includes('slot-border')) return false
        if (c.userData?.classes?.includes('overable')) {
            return slots.includes(c.name as slots_id)
        }
        return slots.includes(c.name as slots_id)
    })

    const intersects = raycaster.intersectObjects(targets, true)
    for (const hit of intersects) {
        const slotId = resolveSlotIdFromObject(hit.object, slots)
        if (!slotId) continue

        // Préfère l'overlay overable s'il existe
        const overlay = plane.children.find(
            (c) =>
                c.name === slotId &&
                c.userData?.classes?.includes('overable') &&
                c instanceof THREE.Mesh,
        ) as THREE.Mesh | undefined
        if (overlay) return overlay

        const mesh = plane.children.find(
            (c) =>
                c.name === slotId &&
                c instanceof THREE.Mesh &&
                !c.userData?.classes?.includes('slot-border'),
        ) as THREE.Mesh | undefined
        if (mesh) return mesh
    }

    return null
}

function bindSlotTargeting({
    camera,
    plane,
    slots,
    onPick,
}: {
    camera: THREE.PerspectiveCamera
    plane: THREE.Mesh
    slots: slots_id[]
    onPick: (slot: slots_id) => void
}) {
    let hoveredSlot: THREE.Mesh | null = null

    mouseMoveHandler = (event) => {
        const next = pickSlotByRaycast(event, camera, plane, slots)
        if (hoveredSlot && hoveredSlot !== next) {
            setSlotHoverEmphasis(hoveredSlot, false)
        }
        hoveredSlot = next
        if (hoveredSlot) setSlotHoverEmphasis(hoveredSlot, true)
    }

    pointerDownHandler = (event) => {
        pointerDownPos = { x: event.clientX, y: event.clientY }
    }

    // Re-raycast au release — ignore les drags caméra (OrbitControls)
    clickHandler = (event) => {
        if (pointerDownPos) {
            const dx = event.clientX - pointerDownPos.x
            const dy = event.clientY - pointerDownPos.y
            pointerDownPos = null
            if (dx * dx + dy * dy > 64) return
        }

        const picked = pickSlotByRaycast(event, camera, plane, slots) ?? hoveredSlot
        if (!picked) return
        const slot = (picked.userData?.slotId ?? picked.name) as slots_id
        if (!slots.includes(slot)) return
        onPick(slot)
    }

    window.addEventListener('pointermove', mouseMoveHandler)
    window.addEventListener('pointerdown', pointerDownHandler)
    window.addEventListener('pointerup', clickHandler)
}

/** Annule le ciblage 3D en cours (slots / bakugans). */
export function cancelTurnTargeting(ctx?: TargetingContext, notifyParent = false) {
    detachListeners()
    clearSelectableHighlights()

    if (ctx) {
        if (activeSlots.length) {
            removeOverableSlots(ctx.plane, activeSlots)
            resetSlotsColor(ctx.plane, activeSlots)
        }
        if (dimmedBakuganNames.length) {
            restoreBakuganOpacity(ctx.scene, dimmedBakuganNames)
        }
    }

    activeSlots = []
    dimmedBakuganNames = []

    if (notifyParent) {
        notifyParentActionTargetCancelled()
    }
}

function emitTarget(payload: TurnActionCommitPayload, ctx: TargetingContext) {
    cancelTurnTargeting(ctx, false)
    notifyParentActionTargetSelected(payload)
}

/** Démarre le ciblage unifié (slot pour gate/bakugan, bakugan pour ability/attribut). */
export function startTurnTargeting(
    selection: TurnActionPartialSelection,
    ctx: TargetingContext,
) {
    cancelTurnTargeting(ctx, false)

    const { camera, scene, plane, userId } = ctx

    switch (selection.actionType) {
        case 'SET_GATE_CARD_ACTION': {
            const { key, slots } = selection
            activeSlots = [...slots]

            slots.forEach((slot) => {
                createOverableSlot(slot, plane, { key, image: '' }, true)
            })
            highlightSelectableSlots(plane, slots)

            bindSlotTargeting({
                camera,
                plane,
                slots,
                onPick: (slot) => {
                    emitTarget(
                        {
                            actionType: 'SET_GATE_CARD_ACTION',
                            gateId: key,
                            slot,
                        },
                        ctx,
                    )
                },
            })
            break
        }

        case 'SET_BAKUGAN': {
            const { key, slots } = selection
            activeSlots = [...slots]

            highlightSelectableSlots(plane, slots, selection.attribut)

            bindSlotTargeting({
                camera,
                plane,
                slots,
                onPick: (slot) => {
                    emitTarget(
                        {
                            actionType: 'SET_BAKUGAN',
                            bakuganKey: key,
                            slot,
                        },
                        ctx,
                    )
                },
            })
            break
        }

        case 'USE_ABILITY_CARD': {
            const { key, bakuganNames, bakugans } = selection
            dimmedBakuganNames = [...bakuganNames]

            highlightSelectableBakugans(scene, bakuganNames, userId)

            let bakugan: THREE.Sprite | null = null

            mouseMoveHandler = (event) => {
                bakugan = SelectBakuganOnMouseMove({
                    bakugan,
                    camera,
                    event,
                    scene,
                    names: bakuganNames,
                })
            }

            clickHandler = (event) => {
                // Re-pick au pointerup pour le tactile
                const picked =
                    SelectBakuganOnMouseMove({
                        bakugan: null,
                        camera,
                        event,
                        scene,
                        names: bakuganNames,
                    }) ?? bakugan

                if (!picked?.userData?.bakuganKey) return
                const bakuganKey = (picked.userData as SpriteUserData).bakuganKey
                const entry = bakugans.find((b) => b.bakuganKey === bakuganKey)
                if (!entry) return

                emitTarget(
                    {
                        actionType: 'USE_ABILITY_CARD',
                        abilityId: key,
                        bakuganKey: entry.bakuganKey,
                        slot: entry.slot,
                    },
                    ctx,
                )
            }

            window.addEventListener('pointermove', mouseMoveHandler)
            window.addEventListener('pointerup', clickHandler)
            break
        }

        case 'CHANGE_ATTRIBUTE': {
            const { attribut, bakuganNames, bakugans } = selection
            dimmedBakuganNames = [...bakuganNames]

            highlightSelectableBakugans(scene, bakuganNames, userId)

            let bakugan: THREE.Sprite | null = null

            mouseMoveHandler = (event) => {
                bakugan = SelectBakuganOnMouseMove({
                    bakugan,
                    camera,
                    event,
                    scene,
                    names: bakuganNames,
                })
            }

            clickHandler = (event) => {
                const picked =
                    SelectBakuganOnMouseMove({
                        bakugan: null,
                        camera,
                        event,
                        scene,
                        names: bakuganNames,
                    }) ?? bakugan

                if (!picked) return
                const userData = picked.userData as SpriteUserData
                const selected = bakugans.find(
                    (b) =>
                        b.key === userData.bakuganKey &&
                        b.userId === userData.userId &&
                        b.slot_id === userData.slot,
                )
                if (!selected) return

                emitTarget(
                    {
                        actionType: 'CHANGE_ATTRIBUTE',
                        attribut,
                        bakugan: selected,
                    },
                    ctx,
                )
            }

            window.addEventListener('pointermove', mouseMoveHandler)
            window.addEventListener('pointerup', clickHandler)
            break
        }
    }
}

function emitAdditionalTarget(payload: AdditionalTargetResult, ctx: TargetingContext) {
    cancelTurnTargeting(ctx, false)
    notifyParentAdditionalTargetSelected(payload)
}

function bindBakuganPick({
    camera,
    scene,
    bakuganNames,
    onPick,
}: {
    camera: THREE.PerspectiveCamera
    scene: THREE.Scene
    bakuganNames: string[]
    onPick: (sprite: THREE.Sprite) => void
}) {
    let bakugan: THREE.Sprite | null = null

    mouseMoveHandler = (event) => {
        bakugan = SelectBakuganOnMouseMove({
            bakugan,
            camera,
            event,
            scene,
            names: bakuganNames,
        })
    }

    clickHandler = (event) => {
        const picked =
            SelectBakuganOnMouseMove({
                bakugan: null,
                camera,
                event,
                scene,
                names: bakuganNames,
            }) ?? bakugan

        if (!picked?.userData?.bakuganKey) return
        onPick(picked)
    }

    window.addEventListener('pointermove', mouseMoveHandler)
    window.addEventListener('pointerup', clickHandler)
}

function resolveBakuganFromSprite(
    sprite: THREE.Sprite,
    bakugans: bakuganToMoveType2[],
): bakuganToMoveType2 | null {
    const userData = sprite.userData as SpriteUserData
    return (
        bakugans.find(
            (b) => b.key === userData.bakuganKey && b.userId === userData.userId,
        ) ??
        bakugans.find((b) => b.key === userData.bakuganKey) ??
        null
    )
}

/** Démarre le ciblage 3D pour une ability/gate additional request. */
export function startAdditionalTargeting(
    selection: AdditionalPartialSelection,
    ctx: TargetingContext,
) {
    cancelTurnTargeting(ctx, false)

    const { camera, scene, plane } = ctx

    switch (selection.mode) {
        case 'SELECT_SLOT': {
            const { slots, emptySlot, attribut } = selection
            activeSlots = [...slots]

            if (!emptySlot) {
                slots.forEach((slot) => {
                    createOverableSlot(slot, plane, { key: '', image: '' }, true)
                })
            }
            highlightSelectableSlots(plane, slots, attribut)

            bindSlotTargeting({
                camera,
                plane,
                slots,
                onPick: (slot) => {
                    emitAdditionalTarget({ mode: 'SELECT_SLOT', slot }, ctx)
                },
            })
            break
        }

        case 'SELECT_BAKUGAN_ON_DOMAIN':
        case 'ATTRACT_BAKUGAN': {
            const { bakuganNames, bakugans, mode } = selection
            dimmedBakuganNames = [...bakuganNames]
            // Additional : cibles potentiellement adverses → pas de filtre owner
            highlightSelectableBakugans(scene, bakuganNames)

            bindBakuganPick({
                camera,
                scene,
                bakuganNames,
                onPick: (sprite) => {
                    const bakugan = resolveBakuganFromSprite(sprite, bakugans)
                    if (!bakugan) return
                    emitAdditionalTarget({ mode, bakugan }, ctx)
                },
            })
            break
        }

        case 'MOVE_BAKUGAN': {
            const { bakuganNames, bakugans, slots } = selection
            dimmedBakuganNames = [...bakuganNames]
            highlightSelectableBakugans(scene, bakuganNames)

            bindBakuganPick({
                camera,
                scene,
                bakuganNames,
                onPick: (sprite) => {
                    const selected = resolveBakuganFromSprite(sprite, bakugans)
                    if (!selected) return

                    const color = new THREE.Color(
                        getAttributColor(
                            (sprite.userData as SpriteUserData).attribut,
                        ),
                    )
                    ;(sprite.material as THREE.SpriteMaterial).color.set(color)

                    // Phase 2 — sélection du slot (listeners remplacés)
                    detachListeners()
                    clearSelectableHighlights()
                    restoreBakuganOpacity(scene, bakuganNames.filter(
                        (n) => n !== `${selected.key}-${selected.userId}`,
                    ))

                    activeSlots = [...slots]
                    slots.forEach((slot) => {
                        createOverableSlot(slot, plane, { key: '', image: '' }, true)
                    })
                    highlightSelectableSlots(
                        plane,
                        slots,
                        (sprite.userData as SpriteUserData).attribut,
                    )

                    bindSlotTargeting({
                        camera,
                        plane,
                        slots,
                        onPick: (slot) => {
                            sprite.material.color.set('white')
                            emitAdditionalTarget(
                                {
                                    mode: 'MOVE_BAKUGAN',
                                    bakugan: selected,
                                    slot,
                                },
                                ctx,
                            )
                        },
                    })
                },
            })
            break
        }
    }
}

