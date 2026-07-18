import type { AppLocale } from '@/i18n'
import { LOCALE_TAGS, DISPLAY_TIME_ZONE } from '@/constants/constants'

export function formatDateTime(utcDate: string | Date, locale: AppLocale): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  return date.toLocaleString(LOCALE_TAGS[locale], {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
