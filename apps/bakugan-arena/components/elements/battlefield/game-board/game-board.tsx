"use client"

import { useRef, useState } from "react"
import GateCardOnBoard from "./gate-cards"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import BakuganSprite from "./bakugan-sprite"

export default function MapScrollable({ userId }: { userId: string }) {

  const slots = useGlobalGameState((state) => state.gameState?.protalSlots)
  const mapRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const slotWithBakugans = slots?.filter((s) => s.bakugans.length > 0).map((b) => b.bakugans).flat()


  if (slots) {
    return (
      <>
        {
          slotWithBakugans?.map((b) => <BakuganSprite key={`${b.userId}-${b.key}-${b.id}`} bakugan={b} userId={userId} />)
        }
        <div
          className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-[75vh] overflow-hidden cursor-grab"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={mapRef}
            className={`perspective-[1000px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[100vw] lg:w-[70vw] lg:h-[75vh]`}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            onMouseDown={handleMouseDown}
          >
            {/* Ici tu peux mettre ta grille de cartes */}
            <div className="rotate-x-[50deg] lg:rotate-x-90 grid grid-cols-3 grid-rows-2 items-center justify-center">
              {slots.map((s, index) => (
                <GateCardOnBoard slotId={s.id} key={index} userId={userId} />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

}
