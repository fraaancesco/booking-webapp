<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Menubar from 'primevue/menubar'
import type { MenuItem } from 'primevue/menuitem'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import SelectButton from 'primevue/selectbutton'
import Button from 'primevue/button'
import { CalendarDays, LogIn, LogOut, Ticket, UserPlus } from '@lucide/vue'
import { useAuthStore } from '@/store/authStore'
import { setLocale, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'

interface BlueprintMenuItem extends MenuItem {
  iconComponent: Component
}

const authStore = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

const localeOptions = SUPPORTED_LOCALES.map((value) => ({
  label: value.toUpperCase(),
  value,
}))

function onLocaleChange(value: AppLocale | null) {
  if (value) {
    setLocale(value)
  }
}

const menuItems = computed<BlueprintMenuItem[]>(() => {
  const items: BlueprintMenuItem[] = [
    {
      label: t('app.nav.events'),
      iconComponent: CalendarDays,
      command: () => void router.push('/'),
    },
  ]
  if (authStore.isLoggedIn) {
    items.push({
      label: t('app.nav.myBookings'),
      iconComponent: Ticket,
      command: () => void router.push('/bookings'),
    })
  }
  return items
})

function onLogout() {
  authStore.logout()
  void router.push('/')
}
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <Menubar :model="menuItems" class="bp-corners app-menubar">
    <template #start>
      <span class="app-brand">{{ t('app.brand') }}</span>
    </template>
    <template #itemicon="{ item }">
      <component :is="(item as BlueprintMenuItem).iconComponent" class="bp-icon" :size="18" :stroke-width="1.5" />
    </template>
    <template #end>
      <div class="app-end">
        <SelectButton
          :model-value="locale"
          :options="localeOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          class="locale-switch"
          @update:model-value="onLocaleChange"
        />
        <div class="auth-actions">
          <template v-if="authStore.isLoggedIn">
            <Button
              class="bp-corners"
              severity="secondary"
              outlined
              :aria-label="t('app.nav.logout')"
              @click="onLogout"
            >
              <LogOut class="bp-icon" :size="18" :stroke-width="1.5" />
              <span class="auth-label">{{ t('app.nav.logout') }}</span>
            </Button>
          </template>
          <template v-else>
            <Button
              class="bp-corners"
              severity="secondary"
              outlined
              :aria-label="t('app.nav.login')"
              @click="router.push('/login')"
            >
              <LogIn class="bp-icon" :size="18" :stroke-width="1.5" />
              <span class="auth-label">{{ t('app.nav.login') }}</span>
            </Button>
            <Button
              class="bp-corners"
              :aria-label="t('app.nav.register')"
              @click="router.push('/register')"
            >
              <UserPlus class="bp-icon" :size="18" :stroke-width="1.5" />
              <span class="auth-label">{{ t('app.nav.register') }}</span>
            </Button>
          </template>
        </div>
      </div>
    </template>
  </Menubar>
  <RouterView />
</template>

<style scoped>
.app-menubar {
  padding-inline: clamp(0.75rem, 4vw, 1.5rem);
}

.app-brand {
  font-family: var(--bp-font-display);
  font-weight: 600;
  font-size: clamp(1rem, 3vw, 1.25rem);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--p-steelblue-700);
  margin-right: clamp(0.75rem, 3vw, 1.5rem);
  white-space: nowrap;
}

.app-end {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.locale-switch :deep(.p-togglebutton) {
  font-family: var(--bp-font-display);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-actions :deep(.p-button) {
  gap: 0.4rem;
}

@media (max-width: 640px) {
  .app-brand {
    margin-right: 0.5rem;
  }

  .auth-label {
    display: none;
  }

  .auth-actions :deep(.p-button) {
    padding-inline: 0.6rem;
  }
}
</style>
