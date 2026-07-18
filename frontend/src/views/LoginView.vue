<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/store/authStore'
import { useAppToast } from '@/composables/useAppToast'

const email = ref('')
const password = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const { apiError } = useAppToast()
const { t } = useI18n()

async function onSubmit() {
  loading.value = true
  try {
    await authStore.login({ email: email.value, password: password.value })
    await router.push('/')
  } catch (error) {
    apiError('auth.loginFailed', error, 4000)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <Card class="bp-corners bp-rise">
      <template #title>{{ t('auth.loginTitle') }}</template>
      <template #content>
        <form class="login-form" @submit.prevent="onSubmit">
          <div class="field">
            <label for="email">{{ t('auth.email') }}</label>
            <InputText id="email" v-model="email" type="email" required autofocus />
          </div>
          <div class="field">
            <label for="password">{{ t('auth.password') }}</label>
            <Password id="password" v-model="password" :feedback="false" toggle-mask required />
          </div>
          <Button
            type="submit"
            :label="t('auth.submitLogin')"
            :loading="loading"
            class="bp-corners bp-corners--on-fill submit-btn"
          />
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  padding: clamp(1rem, 6vw, 2rem);
}

.login-view :deep(.p-card) {
  width: 100%;
  max-width: 24rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field :deep(input) {
  width: 100%;
}

.submit-btn {
  width: 100%;
}
</style>
