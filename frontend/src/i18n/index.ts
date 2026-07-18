import { createI18n } from 'vue-i18n'
import type { MessageSchema } from './message-schema'
import { it } from './locales/it'
import { en } from './locales/en'
import { LOCALE_STORAGE_KEY } from '@/constants/constants'

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}

export type AppLocale = 'it' | 'en'

export const SUPPORTED_LOCALES: AppLocale[] = ['it', 'en']

function isAppLocale(value: string | null): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale)
}

const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
const initialLocale: AppLocale = isAppLocale(storedLocale) ? storedLocale : 'it'

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'it',
  messages: { it, en },
})

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export function translateErrorCode(code: string): string {
  const locale = i18n.global.locale.value
  const errors = i18n.global.messages.value[locale]?.errors as Record<string, string> | undefined
  return errors?.[code] ?? errors?.INTERNAL_ERROR ?? code
}
