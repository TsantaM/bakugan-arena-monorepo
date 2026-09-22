/**
 * Diff / patch structurel minimal pour les snapshots de replay.
 *
 * Un snapshot complet (decks, slots, messages…) pèse plusieurs centaines de Ko.
 * En stocker un par animation donne un replay en O(N²). On ne conserve donc que
 * la différence avec le snapshot précédent : en pratique quelques octets
 * (un power qui change, un slot qui s'ouvre, un message ajouté).
 *
 * Le format est volontairement compact car il transite en JSON (DB + socket) :
 *   { t: "s", v }            remplace la valeur
 *   { t: "o", c?, d? }       objet : patchs enfants `c`, clés supprimées `d`
 *   { t: "a", n, c? }        tableau : nouvelle longueur `n`, indices modifiés `c`
 */

export type replayPatchType =
    | { t: "s"; v?: unknown }
    | { t: "o"; c?: Record<string, replayPatchType>; d?: string[] }
    | { t: "a"; n: number; c?: Record<string, replayPatchType> }

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function cloneValue<T>(value: T): T {
    if (value === undefined || value === null) return value
    if (typeof value !== "object") return value
    return structuredClone(value)
}

/**
 * Patch transformant `base` en `next`, ou `undefined` si les deux sont
 * structurellement identiques. Les valeurs conservées dans le patch sont
 * clonées : `next` peut être un état vivant qui continuera de muter.
 */
export function diffReplayValue(base: unknown, next: unknown): replayPatchType | undefined {
    if (Object.is(base, next)) return undefined

    if (Array.isArray(next)) {
        if (!Array.isArray(base)) {
            return { t: "s", v: cloneValue(next) }
        }

        const children: Record<string, replayPatchType> = {}
        let changed = base.length !== next.length

        for (let i = 0; i < next.length; i++) {
            const childPatch = diffReplayValue(base[i], next[i])
            if (childPatch) {
                children[String(i)] = childPatch
                changed = true
            }
        }

        if (!changed) return undefined

        const patch: replayPatchType = { t: "a", n: next.length }
        if (Object.keys(children).length > 0) patch.c = children
        return patch
    }

    if (isPlainObject(next)) {
        if (!isPlainObject(base)) {
            return { t: "s", v: cloneValue(next) }
        }

        const children: Record<string, replayPatchType> = {}
        const deleted: string[] = []

        for (const key of Object.keys(next)) {
            const childPatch = diffReplayValue(base[key], next[key])
            if (childPatch) children[key] = childPatch
        }

        for (const key of Object.keys(base)) {
            if (base[key] !== undefined && !(key in next)) deleted.push(key)
        }

        if (Object.keys(children).length === 0 && deleted.length === 0) return undefined

        const patch: replayPatchType = { t: "o" }
        if (Object.keys(children).length > 0) patch.c = children
        if (deleted.length > 0) patch.d = deleted
        return patch
    }

    // Primitive, null ou undefined
    return { t: "s", v: next }
}

/**
 * Applique `patch` sur `base` et renvoie la valeur résultante.
 * `base` est muté en place quand c'est possible : l'appelant doit en être
 * propriétaire (le hydrateur travaille sur sa propre copie).
 */
export function applyReplayPatch(base: unknown, patch: replayPatchType | undefined): unknown {
    if (!patch) return base

    if (patch.t === "s") {
        return cloneValue(patch.v)
    }

    if (patch.t === "a") {
        const target = Array.isArray(base) ? base : []

        if (patch.c) {
            for (const [index, childPatch] of Object.entries(patch.c)) {
                const i = Number(index)
                target[i] = applyReplayPatch(target[i], childPatch)
            }
        }

        target.length = patch.n
        return target
    }

    const target = isPlainObject(base) ? base : {}

    if (patch.c) {
        for (const [key, childPatch] of Object.entries(patch.c)) {
            target[key] = applyReplayPatch(target[key], childPatch)
        }
    }

    if (patch.d) {
        for (const key of patch.d) delete target[key]
    }

    return target
}
