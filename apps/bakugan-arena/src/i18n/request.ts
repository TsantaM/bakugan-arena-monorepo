import { getTextDirection, isLocale } from '@bakugan-arena/i18n'
import { getMessagesFlat } from '@bakugan-arena/i18n/server'
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, LOCALE_COOKIE_KEY, parseLocale } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value)

  if (!isLocale(locale)) {
    return {
      locale: defaultLocale,
      messages: getMessagesFlat(defaultLocale),
    }
  }

  return {
    locale,
    messages: getMessagesFlat(locale),
    timeZone: 'UTC',
  }
})

export { getTextDirection }
