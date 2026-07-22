'use client'

import { getTextDirection } from '@bakugan-arena/i18n'
import { parseLocale } from '@/src/i18n/config'
import { useLocale } from 'next-intl'

export type TextDirection = 'ltr' | 'rtl'

/** Direction bidi du texte selon la locale courante (sans inverser le layout global). */
export function useTextDirection(): TextDirection {
  return getTextDirection(parseLocale(useLocale()))
}

/** Props à spreader sur un élément textuel : `<p {...useTextDirProps()}>`. */
export function useTextDirProps(): { dir: TextDirection } {
  return { dir: useTextDirection() }
}
