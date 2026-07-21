'use client'

import { setLocaleCookie } from '@/src/actions/set-locale'
import {
  LOCALE_STORAGE_KEY,
  parseLocale,
} from '@/src/i18n/config'
import { locales } from '@bakugan-arena/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function LanguageSwitcher({
  className,
}: {
  className?: string
}) {
  const t = useTranslations('common.language')
  const locale = parseLocale(useLocale())
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onChange = (value: string) => {
    const next = parseLocale(value)
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // ignore quota / private mode
    }

    startTransition(async () => {
      await setLocaleCookie(next)
      router.refresh()
    })
  }

  return (
    <Select
      value={locale}
      onValueChange={onChange}
      disabled={isPending}
    >
      <SelectTrigger
        size="sm"
        className={className}
        aria-label={t('label')}
      >
        <SelectValue placeholder={t('label')} />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((code) => (
          <SelectItem key={code} value={code}>
            {t(code)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
