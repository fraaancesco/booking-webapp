<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Paginator, { type PageState } from 'primevue/paginator'
import { ShoppingCart, Check, X } from '@lucide/vue'
import { useEventStore } from '@/store/eventStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { MAX_TICKETS_PER_EVENT } from '@/constants/constants'
import type { EventDto } from '@/interfaces/event.interface'
import { useAppToast } from '@/composables/useAppToast'

const eventStore = useEventStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const { success, apiError } = useAppToast()
const { t, locale } = useI18n()

const quantities = ref<Record<string, number>>({})
const submitting = ref(false)

onMounted(() => eventStore.fetchEvents(1))

function onPageChange(event: PageState) {
  void eventStore.fetchEvents(event.page + 1)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'it-IT')
}

function addToCart(event: EventDto) {
  cartStore.setItem(event.id, event.name, quantities.value[event.id] ?? 1)
}

async function submitBooking() {
  if (!authStore.isLoggedIn) {
    await router.push('/login')
    return
  }
  submitting.value = true
  try {
    await cartStore.submit()
    success('events.notificationConfirmed', { detailKey: 'events.notificationSimulated', life: 4000 })
    await eventStore.fetchEvents()
  } catch (error) {
    apiError('events.bookingFailed', error)
    await eventStore.fetchEvents()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="events-view">
    <section class="events-list-wrap">
      <div class="events-list">
        <Card
          v-for="(event, index) in eventStore.events"
          :key="event.id"
          class="bp-corners bp-rise event-card"
          :style="{ '--bp-stagger': index }"
        >
          <template #title>{{ event.name }}</template>
          <template #subtitle>
            {{ formatDate(event.date) }}
          </template>
          <template #content>
            <p v-if="event.description">{{ event.description }}</p>
            <Tag
              :severity="event.availableSeats > 0 ? 'success' : 'danger'"
              :value="
                event.availableSeats > 0
                  ? t('events.seatsAvailable', { count: event.availableSeats })
                  : t('events.soldOut')
              "
            />
          </template>
          <template #footer>
            <div v-if="event.availableSeats > 0" class="event-actions">
              <InputNumber
                v-model="quantities[event.id]"
                :min="1"
                :max="Math.min(MAX_TICKETS_PER_EVENT, event.availableSeats)"
                show-buttons
                button-layout="horizontal"
                :default-value="1"
                class="event-qty"
              />
              <Button :label="t('events.add')" class="bp-corners bp-corners--on-fill" @click="addToCart(event)">
                <template #icon>
                  <ShoppingCart class="bp-icon" :size="16" :stroke-width="1.5" />
                </template>
              </Button>
            </div>
          </template>
        </Card>
      </div>

      <Paginator
        v-if="eventStore.total > eventStore.limit"
        :rows="eventStore.limit"
        :total-records="eventStore.total"
        :first="(eventStore.page - 1) * eventStore.limit"
        @page="onPageChange"
      />
    </section>

    <aside v-if="cartStore.count > 0" class="cart-panel bp-rise">
      <Card class="bp-corners">
        <template #title>{{ t('events.cartTitle') }}</template>
        <template #content>
          <ul class="cart-items">
            <li v-for="[eventId, item] in cartStore.items" :key="eventId">
              <span>{{ item.eventName }} x{{ item.quantity }}</span>
              <Button
                severity="danger"
                text
                rounded
                :aria-label="t('events.remove')"
                @click="cartStore.removeItem(eventId)"
              >
                <template #icon>
                  <X class="bp-icon" :size="16" :stroke-width="1.5" />
                </template>
              </Button>
            </li>
          </ul>
        </template>
        <template #footer>
          <Button
            :label="t('events.bookTickets', { count: cartStore.totalTickets })"
            :loading="submitting"
            class="bp-corners bp-corners--on-fill submit-btn"
            @click="submitBooking"
          >
            <template #icon>
              <Check class="bp-icon" :size="16" :stroke-width="1.5" />
            </template>
          </Button>
        </template>
      </Card>
    </aside>
  </div>
</template>

<style scoped>
.events-view {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: clamp(1rem, 4vw, 1.5rem);
  align-items: flex-start;
}

.events-list-wrap {
  flex: 1 1 20rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}

.event-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.event-card :deep(.p-card-body) {
  height: 100%;
  min-width: 0;
}

.cart-panel {
  width: 20rem;
  max-width: 100%;
  flex: 0 0 auto;
  position: sticky;
  top: 1.5rem;
}

.event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  min-width: 0;
}

.event-qty {
  flex: 1 1 8rem;
  min-width: 0;
  max-width: 100%;
}

.event-qty :deep(.p-inputnumber-input) {
  width: 100%;
  min-width: 0;
}

.cart-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cart-items li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.cart-items li span {
  overflow-wrap: anywhere;
}

.submit-btn {
  width: 100%;
}

@media (max-width: 46rem) {
  .events-view {
    flex-direction: column;
  }

  .cart-panel {
    width: 100%;
    position: static;
  }
}
</style>
