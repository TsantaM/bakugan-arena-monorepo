'use client'

import { useTextDirection } from '@/hooks/use-text-direction'
import { cn } from '@/lib/utils'
import type { ElementType, ComponentPropsWithoutRef } from 'react'

type TextElement =
  | 'span'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'div'
  | 'li'
  | 'strong'
  | 'em'

type TextProps<T extends TextElement> = {
  as?: T
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

/**
 * Wrapper textuel qui applique `dir` selon la locale (RTL pour l'arabe).
 * Préférer ce composant (ou `useTextDirProps`) plutôt que `dir` sur un layout.
 */
export function Text<T extends TextElement = 'span'>({
  as,
  className,
  dir: dirProp,
  ...props
}: TextProps<T>) {
  const localeDir = useTextDirection()
  const Comp = (as ?? 'span') as ElementType

  return (
    <Comp
      dir={dirProp ?? localeDir}
      className={cn(className)}
      {...props}
    />
  )
}
