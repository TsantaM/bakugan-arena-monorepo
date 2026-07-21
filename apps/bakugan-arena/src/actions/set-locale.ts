'use server'

import { isLocale } from '@bakugan-arena/i18n'
import { cookies } from 'next/headers'
import {
  LOCALE_COOKIE_KEY,
  LOCALE_COOKIE_MAX_AGE,
  defaultLocale,
  type Locale,
} from '@/src/i18n/config'

export async function setLocaleCookie(locale: string): Promise<Locale> {
  const nextLocale = isLocale(locale) ? locale : defaultLocale
  const cookieStore = await cookies()

  cookieStore.set(LOCALE_COOKIE_KEY, nextLocale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  return nextLocale
}
