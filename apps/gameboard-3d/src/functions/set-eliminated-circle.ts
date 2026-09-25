import { setHudEliminated } from "../hud/game-hud"

const ELIMINATED_SLOTS = 3

/**
 * Single source of truth for the KO counters, shared by the HTML circles and
 * the in-scene HUD.
 *
 * Kept in sync by going through `setEliminatedCircles` for absolute values
 * (init, replay snapshots) and `addEliminatedCircle` for one more KO.
 */
const eliminatedCount = { left: 0, right: 0 }

export function setEliminatedCircles({
    count,
    isLeft,
}: {
    count: number
    isLeft: boolean
}) {

    const side = isLeft ? "left" : "right"
    const deadCount = Math.max(0, Math.min(count, ELIMINATED_SLOTS))
    eliminatedCount[side] = deadCount

    setHudEliminated(side, deadCount)

    const selector = isLeft
        ? '.left-eliminated .circle.left-circle'
        : '.right-eliminated .circle.right-circle'

    const circles = Array.from(
        document.querySelectorAll<HTMLDivElement>(selector)
    )

    // Reset total
    circles.forEach(c => c.classList.remove('dead'))

    if (deadCount === 0) return

    if (isLeft) {
        // gauche → depuis la fin
        circles
            .slice(-deadCount)
            .forEach(c => c.classList.add('dead'))
    } else {
        // droite → depuis le début
        circles
            .slice(0, deadCount)
            .forEach(c => c.classList.add('dead'))
    }
}

/** Marks one more KO on a side. */
export function addEliminatedCircle({ isLeft }: { isLeft: boolean }) {
    const side = isLeft ? "left" : "right"

    if (eliminatedCount[side] >= ELIMINATED_SLOTS) {
        console.warn('Aucun cercle disponible à éliminer')
        return
    }

    setEliminatedCircles({ count: eliminatedCount[side] + 1, isLeft })
}
