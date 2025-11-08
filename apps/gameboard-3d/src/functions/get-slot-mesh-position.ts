function getSlotMeshPosition({ index }: { index: number }) {

    const cols = 3
    const rows = 2
    const spacingX = 4
    const spacingY = 6


    const col = index % cols
    const row = Math.floor(index / cols)

    // centrer la grille
    const offsetX = (cols - 1) * spacingX / 2
    const offsetY = (rows - 1) * spacingY / 2

    const x = col * spacingX - offsetX
    const y = -(row * spacingY - offsetY)

    const position = {
        x: x,
        y: y,
        z: 0
    }

    return position

}

export {
    getSlotMeshPosition
}