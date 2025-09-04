"use client"

import useGetRoomState from "@/src/sockets/get-room-state"
import { useRef, useState } from "react"

export default function MapScrollable({ roomId }: { roomId: string }) {

  const { slots } = useGetRoomState({ roomId })

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
  if (slots) {
    return (
      <div
        className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-[75vh] overflow-hidden cursor-grab"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={mapRef}
          className={`absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[100vw] lg:w-[70vw] lg:h-[75vh]`}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
          onMouseDown={handleMouseDown}
        >
          {/* Ici tu peux mettre ta grille de cartes */}
          <div className="grid grid-cols-3 grid-rows-2 items-center justify-center">
            {slots.map((s, index) => (
              <div
                key={index}
                className="aspect-[2/3] border border-slate-50 flex items-center justify-center text-white text-xs"
              >
                {s.portalCard ? s.portalCard.key : s.id}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

}
