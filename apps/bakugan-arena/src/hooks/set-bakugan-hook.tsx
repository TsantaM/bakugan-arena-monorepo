'use client'

import { useState } from "react"

export default function useSetBakuganHook() {
    // Bakugan key when set a bakugan
    const [bakuganToSet, setBakuganToSet] = useState("")
    const selectBakuganToSet = (bakugan: string) => {
        setBakuganToSet(bakugan)
    }

    // Slot where the bakugan will be set
    const [zone, setZone] = useState("")
    const selectZone = (zone: string) => {
        setZone(zone)
    }

    return {
        bakuganToSet, selectBakuganToSet, zone, selectZone
    }
}