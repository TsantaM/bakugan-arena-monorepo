'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const ForfeitButton = dynamic(
  () => import('@/components/elements/battlefield/forfeit-button'),
  { ssr: false },
)

const BattleLogToggle = dynamic(
  () => import('@/components/elements/battle-log/battle-log-toggle'),
  { ssr: false },
)

/** Charge forfeit / battle-log uniquement sur le battlefield. */
export default function BattlefieldHeaderActions() {
  const pathname = usePathname()

  if (!pathname.includes('/dashboard/battlefield')) {
    return null
  }

  return (
    <>
      <ForfeitButton />
      <BattleLogToggle context="battlefield" />
    </>
  )
}
