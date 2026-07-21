'use client'

import { setLocaleCookie } from '@/src/actions/set-locale'
import {
  LOCALE_STORAGE_KEY,
  parseLocale,
  type Locale,
} from '@/src/i18n/config'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Syncs localStorage → cookie on first client paint so the browser preference
 * wins after a cold visit (cookie may be missing while localStorage has a value).
 */
export default function LocaleStorageSync() {
  const locale = useLocale() as Locale
  const router = useRouter()

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    } catch {
      return
    }

    if (!stored) {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
      } catch {
        // ignore
      }
      return
    }

    const preferred = parseLocale(stored)
    if (preferred !== stored) {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, preferred)
      } catch {
        // ignore
      }
    }
    if (preferred === locale) return

    void setLocaleCookie(preferred).then(() => {
      router.refresh()
    })
  }, [locale, router])

  return null
}
