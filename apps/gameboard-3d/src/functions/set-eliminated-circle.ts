export function setEliminatedCircles({
    count,
    isLeft,
}: {
    count: number
    isLeft: boolean
}) {

    // alert(`eh !, ${count}, ${isLeft}`)

    const selector = isLeft
        ? '.left-eliminated .circle.left-circle'
        : '.right-eliminated .circle.right-circle'

    const circles = Array.from(
        document.querySelectorAll<HTMLDivElement>(selector)
    )

    // Sécurité basique
    const max = circles.length
    const deadCount = Math.max(0, Math.min(count, max))

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