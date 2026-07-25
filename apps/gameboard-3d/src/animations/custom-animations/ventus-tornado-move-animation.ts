import type {
    bakuganOnSlot,
    portalSlotsTypeElement,
} from "@bakugan-arena/game-data"
import { Slots } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { GetSpritePosition } from "../../functions/get-sprite-position"
import { buildSpriteUserData } from "../../functions/mesh-status-user-data"
import { playWindTornado } from "../effects"
import { MoveBakugan } from "../move-bakugan-animation"
import type { CustomAnimationContext } from "./types"

const BAKUGAN_REST_Y = 0.75

function isPortalSlot(value: unknown): value is portalSlotsTypeElement {
    return (
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        "bakugans" in value &&
        Array.isArray((value as portalSlotsTypeElement).bakugans)
    )
}

function isBakugan(value: unknown): value is bakuganOnSlot {
    return (
        !!value &&
        typeof value === "object" &&
        "key" in value &&
        "userId" in value
    )
}

/**
 * Ventus wind-tornado relocation —
 * Repositions remaining allies on the source slot, carries the mover inside
 * a traveling wind tornado to the destination, then repositions allies there.
 * Shared by Souffle Tout and Tornade Extrême (replaces MOVE_TO_ANOTHER_SLOT).
 */
export async function VentusTornadoMoveAnimation({
    scene,
    userId,
    data,
}: CustomAnimationContext): Promise<void> {
    const payload = data.payload ?? {}
    const bakugan = (isBakugan(payload.bakugan) ? payload.bakugan : data.targetBakugans?.[0]) ?? null
    const initialSlot = isPortalSlot(payload.initialSlot) ? payload.initialSlot : null
    const newSlot = isPortalSlot(payload.newSlot) ? payload.newSlot : null

    if (!bakugan || !initialSlot || !newSlot) return

    const bakuganMesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    if (!bakuganMesh) return

    const ventus = new THREE.Color(getAttributColor("Ventus"))
    const core = ventus.clone().lerp(new THREE.Color(0xffffff), 0.55)
    const mid = ventus.clone()
    const tip = ventus.clone().lerp(new THREE.Color(0x14532d), 0.35)

    const start = bakuganMesh.position.clone()
    start.y = 0.12

    const dest = GetSpritePosition({
        slot: newSlot,
        userId,
        bakugan: { ...bakugan, slot_id: newSlot.id },
        slotIndex: Slots.indexOf(newSlot.id),
    })
    if (!dest) return

    const to = new THREE.Vector3(dest.x, 0.12, dest.z)

    const alliesOnInitial = initialSlot.bakugans.filter(
        (b) => b.userId === bakugan.userId && b.key !== bakugan.key,
    )
    const slotWithoutMover: portalSlotsTypeElement = {
        ...initialSlot,
        bakugans: initialSlot.bakugans.filter(
            (b) => !(b.key === bakugan.key && b.userId === bakugan.userId),
        ),
    }

    let tornado: ReturnType<typeof playWindTornado> | null = null

    try {
        // 1 — Reposition allies left on the source slot
        await Promise.all(
            alliesOnInitial.map((ally) =>
                MoveBakugan({
                    bakugan: ally,
                    scene,
                    slot: slotWithoutMover,
                    userId,
                    duration: 0.4,
                }),
            ),
        )

        // 2 — Wind tornado forms on the target and carries it to the destination
        tornado = playWindTornado({
            scene,
            position: start,
            to,
            colors: { core, mid, tip },
            shape: {
                count: 58,
                height: 2.2,
                spread: 0.48,
                sizeMin: 0.05,
                sizeMax: 0.15,
                stretchY: 2.3,
            },
            formDuration: 0.32,
            travelDuration: 0.85,
            holdDuration: 0.12,
            spins: 3.5,
            fadeDuration: 0.3,
        })

        // Bakugan rides along with the tornado column
        const travelPromise = new Promise<void>((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve })
            tl.to(bakuganMesh.position, {
                y: BAKUGAN_REST_Y + 0.4,
                duration: 0.32,
                ease: "power2.out",
            }, 0)
            tl.to(bakuganMesh.position, {
                x: dest.x,
                z: dest.z,
                duration: 0.85,
                ease: "power1.inOut",
            }, 0.32)
            tl.to(bakuganMesh.position, {
                y: BAKUGAN_REST_Y,
                duration: 0.28,
                ease: "power2.in",
            }, 0.95)
        })

        await Promise.all([travelPromise, tornado.done])

        bakuganMesh.position.set(dest.x, BAKUGAN_REST_Y, dest.z)
        bakuganMesh.userData = buildSpriteUserData({
            ...bakugan,
            slot_id: newSlot.id,
        })

        // 3 — Reposition allies already on the destination slot
        const alliesOnNew = newSlot.bakugans.filter(
            (b) => b.userId === bakugan.userId && b.key !== bakugan.key,
        )
        await Promise.all(
            alliesOnNew.map((ally) =>
                MoveBakugan({
                    bakugan: ally,
                    scene,
                    slot: newSlot,
                    userId,
                    duration: 0.4,
                }),
            ),
        )
    } finally {
        tornado?.dispose()

        gsap.killTweensOf(bakuganMesh.position)
        bakuganMesh.position.set(dest.x, BAKUGAN_REST_Y, dest.z)
        bakuganMesh.userData = buildSpriteUserData({
            ...bakugan,
            slot_id: newSlot.id,
        })
    }
}
