import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthService } from '@/services/authService'
import type { AuthCredentials } from '@/interfaces/auth.interface'

export const useAuthStore = defineStore('auth', () => {
  const authService = useAuthService()
  const token = ref<string | null>(authService.getToken())

  const isLoggedIn = computed(() => token.value !== null)

  async function login(credentials: AuthCredentials) {
    token.value = await authService.login(credentials)
  }

  async function register(credentials: AuthCredentials) {
    return authService.register(credentials)
  }

  function logout() {
    authService.logout()
    token.value = null
  }

  return {
    token,
    isLoggedIn,
    login,
    register,
    logout,
  }
})
