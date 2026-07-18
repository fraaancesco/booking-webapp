import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getEvents } from '@/api/events'
import type { EventDto } from '@/interfaces/event.interface'

export const useEventStore = defineStore('event', () => {
  const events = ref<EventDto[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(6)
  const loading = ref(false)

  async function fetchEvents(nextPage = page.value) {
    loading.value = true
    try {
      const result = await getEvents({ page: nextPage, limit: limit.value })
      events.value = result.items
      total.value = result.total
      page.value = result.page
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    total,
    page,
    limit,
    loading,
    fetchEvents,
  }
})
