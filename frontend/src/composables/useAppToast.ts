import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { ApiError } from '@/api/api-error'
import { translateErrorCode } from '@/i18n'

const DEFAULT_SUCCESS_LIFE = 3000
const DEFAULT_ERROR_LIFE = 5000

export function useAppToast() {
  const toast = useToast()
  const { t } = useI18n()

  function success(summaryKey: string, options?: { detailKey?: string; life?: number }) {
    toast.add({
      severity: 'success',
      summary: t(summaryKey),
      detail: options?.detailKey ? t(options.detailKey) : undefined,
      life: options?.life ?? DEFAULT_SUCCESS_LIFE,
    })
  }

  function apiError(summaryKey: string, error: unknown, life = DEFAULT_ERROR_LIFE) {
    const code = error instanceof ApiError ? error.code : 'INTERNAL_ERROR'
    toast.add({
      severity: 'error',
      summary: t(summaryKey),
      detail: translateErrorCode(code),
      life,
    })
  }

  return { success, apiError }
}
