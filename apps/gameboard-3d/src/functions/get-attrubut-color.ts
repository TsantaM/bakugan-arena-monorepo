import type { attribut } from "@bakugan-arena/game-data"

export function getAttributColor(attribut: attribut) {
    switch (attribut) {
        case 'Pyrus': return '#ef4444'     // red-500
        case 'Aquos': return '#3b82f6'     // blue-500
        case 'Haos': return '#facc15'      // yellow-400
        case 'Darkus': return '#7e22ce'    // purple-700
        case 'Ventus': return '#22c55e'    // green-500
        case 'Subterra': return '#ea580c'  // orange-600
        default: return '#6b7280'          // gray-500
    }
}