export function isMouseOverUI(event: MouseEvent): boolean {
    const target = event.target as HTMLElement | null
    if (!target) return false

    return Boolean(
        target.closest('.select-bakugan-action') ||
        target.closest('.card-selecter')
    )
}