import tippy, { type Instance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export let tooltip: Instance | null = null

export function initTooltip() {
    if (!tooltip) {
        tooltip = tippy(document.body, {
            content: '',
            trigger: 'manual',
            placement: 'top',
            followCursor: true,
            allowHTML: true
        })
    }
}

export function showTooltip(content: string) {
    if (!tooltip) return
    tooltip.setContent(content)
    tooltip.show()
}

export function hideTooltip() {
    if (!tooltip) return
    tooltip?.hide()
}

