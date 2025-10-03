'use client'

import { spritePosition, useSpritePositionAnchor } from "@/src/store/sprites-positions-anchor";
import { bakuganOnSlot } from "@bakugan-arena/game-data";
import { useEffect, useRef } from "react";

export default function Anchor({ bakugan }: { bakugan: bakuganOnSlot }) {
  const ref = useRef<HTMLDivElement>(null)
  const { setSpritesPositions } = useSpritePositionAnchor()

  const rect = ref.current?.getBoundingClientRect()
  console.log(rect?.top, rect?.left)

  useEffect(() => {
    if (!ref.current) return

    const updatePosition = () => {
      if (!ref.current) return
      if(!rect) return
      const data: spritePosition = {
        key: bakugan.key,
        userId: bakugan.userId,
        x: rect.left,
        y: rect.top,
        h: rect.height,
        w: rect.width,
      }
      setSpritesPositions(data)
      console.log(data.x, data.y)
    }

    // 🔎 Première update
    updatePosition()

    // 👀 Observer les changements de taille/position
    const resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(ref.current)

    // 👂 Écouter scroll + resize fenêtre
    window.addEventListener("scroll", updatePosition)
    window.addEventListener("resize", updatePosition)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  }, [bakugan.key, bakugan.userId, setSpritesPositions, rect?.left, rect?.top])

  return (
    <div ref={ref} className="size-12 lg:size-20" />
  )
}