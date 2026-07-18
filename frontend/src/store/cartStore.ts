import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createBooking } from '@/api/bookings'
import { MAX_TICKETS_PER_EVENT } from '@/constants/constants'

interface CartItem {
  eventName: string
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(new Map<string, CartItem>())

  const count = computed(() => items.value.size)

  const totalTickets = computed(() =>
    [...items.value.values()].reduce((sum, item) => sum + item.quantity, 0),
  )

  function setItem(eventId: string, eventName: string, quantity: number) {
    const clamped = Math.min(Math.max(quantity, 1), MAX_TICKETS_PER_EVENT)
    items.value.set(eventId, { eventName, quantity: clamped })
  }

  function removeItem(eventId: string) {
    items.value.delete(eventId)
  }

  function clear() {
    items.value.clear()
  }

  async function submit() {
    const payload = [...items.value.entries()].map(([eventId, item]) => ({
      eventId,
      quantity: item.quantity,
    }))
    const booking = await createBooking(payload)
    clear()
    return booking
  }

  return {
    items,
    count,
    totalTickets,
    setItem,
    removeItem,
    clear,
    submit,
  }
})
