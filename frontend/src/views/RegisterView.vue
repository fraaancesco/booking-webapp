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
    await authStore.register({ email: email.value, password: password.value })
    await authStore.login({ email: email.value, password: password.value })
    await router.push('/')
  } catch (error) {
    apiError('auth.registerFailed', error, 4000)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-view">
    <Card class="bp-corners bp-rise">
      <template #title>{{ t('auth.registerTitle') }}</template>
      <template #content>
        <form class="register-form" @submit.prevent="onSubmit">
          <div class="field">
            <label for="email">{{ t('auth.email') }}</label>
            <InputText id="email" v-model="email" type="email" required autofocus />
          </div>
          <div class="field">
            <label for="password">{{ t('auth.passwordHint') }}</label>
            <Password id="password" v-model="password" :feedback="false" toggle-mask required />
          </div>
          <Button
            type="submit"
            :label="t('auth.submitRegister')"
            :loading="loading"
            class="bp-corners bp-corners--on-fill submit-btn"
          />
          <RouterLink to="/login">{{ t('auth.haveAccount') }}</RouterLink>
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  padding: clamp(1rem, 6vw, 2rem);
}

.register-view :deep(.p-card) {
  width: 100%;
  max-width: 24rem;
}

.register-form {
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
