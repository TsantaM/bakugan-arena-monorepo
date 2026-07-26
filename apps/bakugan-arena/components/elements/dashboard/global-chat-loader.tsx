'use client'

import dynamic from 'next/dynamic'

const GlobalChat = dynamic(
  () => import('@/components/elements/global-chat/global-chat'),
  { ssr: false },
)

export default function GlobalChatLoader() {
  return <GlobalChat />
}
