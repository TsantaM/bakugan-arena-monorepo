import gsap from 'gsap'
import * as THREE from 'three'
import { type attribut, type slots_id } from '@bakugan-arena/game-data'
import { getAttributColor } from '../functions/get-attrubut-color'

type AnyMaterial = THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | THREE.SpriteMaterial

type MeshSnapshot = {
    mesh: THREE.Mesh
    color: THREE.Color
    opacity: number
    transparent: boolean
    visible: boolean
    materialVisible: boolean
    scale: THREE.Vector3
}

type SpriteSnapshot = {
    sprite: THREE.Sprite
    color: THREE.Color
    opacity: number
}

const tweens: gsap.core.Tween[] = []
const meshSnapshots: MeshSnapshot[] = []
const spriteSnapshots: SpriteSnapshot[] = []
const borderLines: THREE.LineSegments[] = []

const BLINK = {
    duration: 0.55,
    opacityLow: 0.45,
    opacityHigh: 1,
    ease: 'sine.inOut' as const,
}

function trackTween(tween: gsap.core.Tween) {
    tweens.push(tween)
}

/** Même clignotement pour slots et bakugans : opacity + légère variation de teinte. */
function blinkMaterial(mat: AnyMaterial, accent: THREE.Color) {
    mat.transparent = true
    mat.color.copy(accent)
    mat.opacity = BLINK.opacityHigh

    trackTween(
        gsap.to(mat, {
            opacity: BLINK.opacityLow,
            duration: BLINK.duration,
            yoyo: true,
            repeat: -1,
            ease: BLINK.ease,
        }),
    )

    trackTween(
        gsap.to(mat.color, {
            r: Math.min(1, accent.r + 0.2),
            g: Math.min(1, accent.g + 0.2),
            b: Math.min(1, accent.b + 0.2),
            duration: BLINK.duration,
            yoyo: true,
            repeat: -1,
            ease: BLINK.ease,
        }),
    )
}

function resolveAccent(colorHint?: attribut | string): THREE.Color {
    const attributeNames = ['Pyrus', 'Aquos', 'Haos', 'Darkus', 'Ventus', 'Subterra']
    if (colorHint && attributeNames.includes(colorHint)) {
        return new THREE.Color(getAttributColor(colorHint as attribut))
    }
    if (typeof colorHint === 'string') {
        return new THREE.Color(colorHint)
    }
    return new THREE.Color('#38bdf8')
}

/** Fine bordure plus claire que la teinte de clignotement. */
function addSlotBorder(plane: THREE.Mesh, mesh: THREE.Mesh, accent: THREE.Color) {
    const lighter = accent.clone().lerp(new THREE.Color(0xffffff), 0.5)
    const edges = new THREE.EdgesGeometry(mesh.geometry)
    const lineMat = new THREE.LineBasicMaterial({
        color: lighter,
        transparent: true,
        opacity: 0.95,
        depthTest: true,
    })
    const border = new THREE.LineSegments(edges, lineMat)
    border.position.copy(mesh.position)
    border.rotation.copy(mesh.rotation)
    border.scale.copy(mesh.scale.x === 0 ? new THREE.Vector3(1, 1, 1) : mesh.scale)
    border.position.y += 0.03
    border.name = `slot-border-${mesh.name}`
    border.userData = { classes: ['turn-action-mesh', 'slot-border'], slotId: mesh.name }
    // Ne doit jamais bloquer le raycast des slots
    border.raycast = () => {}
    plane.add(border)
    borderLines.push(border)

    trackTween(
        gsap.to(lineMat, {
            opacity: 0.55,
            duration: BLINK.duration,
            yoyo: true,
            repeat: -1,
            ease: BLINK.ease,
        }),
    )
}

/** Stoppe tous les feedbacks visuels de ciblage. */
export function clearSelectableHighlights() {
    tweens.forEach((t) => t.kill())
    tweens.length = 0

    for (const snap of meshSnapshots) {
        const mat = snap.mesh.material as AnyMaterial
        mat.color.copy(snap.color)
        mat.opacity = snap.opacity
        mat.transparent = snap.transparent
        mat.visible = snap.materialVisible
        snap.mesh.visible = snap.visible
        snap.mesh.scale.copy(snap.scale)
    }
    meshSnapshots.length = 0

    for (const snap of spriteSnapshots) {
        const mat = snap.sprite.material as THREE.SpriteMaterial
        mat.color.copy(snap.color)
        mat.opacity = snap.opacity
    }
    spriteSnapshots.length = 0

    for (const border of borderLines) {
        border.parent?.remove(border)
        border.geometry.dispose()
        ;(border.material as THREE.Material).dispose()
    }
    borderLines.length = 0
}

function snapshotMesh(mesh: THREE.Mesh): boolean {
    if (meshSnapshots.some((s) => s.mesh === mesh)) return false
    const mat = mesh.material as AnyMaterial
    meshSnapshots.push({
        mesh,
        color: mat.color.clone(),
        opacity: mat.opacity,
        transparent: mat.transparent,
        visible: mesh.visible,
        materialVisible: mat.visible,
        scale: mesh.scale.clone(),
    })
    return true
}

function snapshotSprite(sprite: THREE.Sprite): boolean {
    if (spriteSnapshots.some((s) => s.sprite === sprite)) return false
    const mat = sprite.material as THREE.SpriteMaterial
    spriteSnapshots.push({
        sprite,
        color: mat.color.clone(),
        opacity: mat.opacity,
    })
    return true
}

/** Slots cliquables : clignotement + fine bordure claire. */
export function highlightSelectableSlots(
    plane: THREE.Mesh,
    slots: slots_id[],
    colorHint?: attribut | string,
) {
    const accent = resolveAccent(colorHint)
    const bordered = new Set<string>()

    slots.forEach((slotId) => {
        const meshes = plane.children.filter(
            (c): c is THREE.Mesh => c instanceof THREE.Mesh && c.name === slotId,
        )

        meshes.forEach((mesh) => {
            if (!snapshotMesh(mesh)) return
            mesh.visible = true
            const mat = mesh.material as AnyMaterial
            // Slots vides : material.visible=false bloquait le rendu / la sélection
            mat.visible = true
            if (mesh.scale.x === 0 && mesh.scale.y === 0) {
                mesh.scale.set(1, 1, 1)
            }
            blinkMaterial(mat, accent)

            // Une seule bordure par slot (évite le double trait overlay + mesh)
            if (!bordered.has(slotId)) {
                addSlotBorder(plane, mesh, accent)
                bordered.add(slotId)
            }
        })
    })
}

/** Overlay gate : même clignotement unifié. */
export function styleGateOverlayAsSelectable(mesh: THREE.Mesh, colorHint?: attribut | string) {
    if (!snapshotMesh(mesh)) return
    mesh.visible = true
    blinkMaterial(mesh.material as AnyMaterial, resolveAccent(colorHint))
}

/** Bakugans éligibles : même clignotement ; les autres assombris.
 *  Si `ownerUserId` est fourni, ne touche que les sprites de ce joueur (tour abilities).
 *  Sinon, considère tous les bakugans du plateau (additional requests).
 */
export function highlightSelectableBakugans(
    scene: THREE.Scene,
    eligibleNames: string[],
    ownerUserId?: string,
) {
    scene.traverse((obj) => {
        if (!(obj instanceof THREE.Sprite)) return
        if (!obj.userData?.bakuganKey) return
        if (ownerUserId && !obj.name.endsWith(`-${ownerUserId}`)) return

        if (!snapshotSprite(obj)) return
        const mat = obj.material as THREE.SpriteMaterial
        mat.transparent = true

        if (eligibleNames.includes(obj.name)) {
            const accent = new THREE.Color(getAttributColor(obj.userData.attribut))
            blinkMaterial(mat, accent)
        } else {
            mat.opacity = 0.35
            mat.color.setRGB(0.45, 0.45, 0.45)
        }
    })
}

/** Survol slot : léger boost d’opacity. */
export function setSlotHoverEmphasis(mesh: THREE.Mesh | null, emphasized: boolean) {
    if (!mesh) return
    const mat = mesh.material as AnyMaterial
    if (!mat) return
    if (emphasized) {
        mat.opacity = Math.max(mat.opacity, 0.9)
    }
}
