<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import Card from 'primevue/card'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import { Trash2 } from '@lucide/vue'
import { getMyBookings, deleteBooking } from '@/api/bookings'
import type { AppLocale } from '@/i18n'
import { formatDateTime } from '@/utils/date'
import { useAppToast } from '@/composables/useAppToast'
import type { BookingDto } from '@/interfaces/booking.interface'
import type { BookingRow } from '@/interfaces/booking-row.interface'

const { t, locale } = useI18n()
const confirm = useConfirm()
const { success, apiError } = useAppToast()

const PAGE_SIZE = 10

const rows = ref<BookingRow[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)

const search = ref('')
const dateRange = ref<Date[] | null>(null)

let searchDebounce: ReturnType<typeof setTimeout> | undefined

async function fetchBookings(nextPage = page.value) {
  loading.value = true
  try {
    const [dateFrom, dateTo] = dateRange.value ?? []
    const result = await getMyBookings({
      page: nextPage,
      limit: PAGE_SIZE,
      search: search.value || undefined,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    })
    rows.value = result.items
      .flatMap((booking: BookingDto) =>
        booking.items.map((item) => ({
          id: item.id,
          bookingId: booking.id,
          eventName: item.event.name,
          bookedAt: formatDateTime(booking.createdAt, locale.value as AppLocale),
          tickets: item.quantity,
        })),
      )
      .sort((a, b) => a.eventName.localeCompare(b.eventName))
    total.value = result.total
    page.value = result.page
  } finally {
    loading.value = false
  }
}

function onPage(event: DataTablePageEvent) {
  void fetchBookings(event.page + 1)
}

function onSearchInput() {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => void fetchBookings(1), 300)
}

function confirmRemove(bookingId: string) {
  confirm.require({
    header: t('bookings.removeConfirmTitle'),
    message: t('bookings.removeConfirmMessage'),
    acceptLabel: t('bookings.removeConfirmAccept'),
    rejectLabel: t('bookings.removeConfirmReject'),
    acceptProps: { severity: 'danger' },
    rejectProps: { text: true },
    accept: () => void removeBooking(bookingId),
  })
}

async function removeBooking(bookingId: string) {
  try {
    await deleteBooking(bookingId)
    success('bookings.removeSuccess')
    await fetchBookings(page.value)
  } catch (error) {
    apiError('bookings.removeFailed', error)
  }
}

watch(dateRange, () => void fetchBookings(1))

onMounted(() => fetchBookings(1))
</script>

<template>
  <div class="bookings-view">
    <Card class="bp-corners bp-rise">
      <template #title>{{ t('bookings.title') }}</template>
      <template #content>
        <div class="filters">
          <InputText v-model="search" :placeholder="t('bookings.searchPlaceholder')" @input="onSearchInput" />
          <DatePicker
            v-model="dateRange"
            selection-mode="range"
            :placeholder="t('bookings.dateRangePlaceholder')"
            show-icon
            icon-display="input"
            date-format="dd/mm/yy"
          />
        </div>

        <div class="table-scroll">
          <DataTable
            :value="rows"
            :loading="loading"
            :empty-message="t('bookings.empty')"
            scrollable
            scroll-height="flex"
            paginator
            lazy
            :rows="PAGE_SIZE"
            :total-records="total"
            :first="(page - 1) * PAGE_SIZE"
            @page="onPage"
          >
            <Column field="eventName" :header="t('bookings.event')" style="min-width: 16rem" />
            <Column field="bookedAt" :header="t('bookings.bookedAt')" style="min-width: 12rem" />
            <Column field="tickets" :header="t('bookings.tickets')" style="min-width: 8rem" />
            <Column :header="t('bookings.actions')" style="min-width: 8rem">
              <template #body="{ data }">
                <Button
                  severity="danger"
                  text
                  :label="t('bookings.remove')"
                  @click="confirmRemove((data as BookingRow).bookingId)"
                >
                  <template #icon>
                    <Trash2 class="bp-icon" :size="16" :stroke-width="1.5" />
                  </template>
                </Button>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.bookings-view {
  padding: clamp(1rem, 4vw, 1.5rem);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filters > * {
  flex: 1 1 14rem;
  min-width: 0;
}

.table-scroll {
  overflow-x: auto;
}
</style>
