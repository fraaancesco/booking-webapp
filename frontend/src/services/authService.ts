import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/constants'
import { loginRequest, registerRequest } from '@/api/auth'
import type { AuthCredentials } from '@/interfaces/auth.interface'

export function useAuthService() {
  async function login(credentials: AuthCredentials) {
    const { access_token } = await loginRequest(credentials)
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, access_token)
    return access_token
  }

  async function register(credentials: AuthCredentials) {
    return registerRequest(credentials)
  }

  function logout() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  }

  function getToken() {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  }

  return {
    login,
    register,
    logout,
    getToken,
  }
}
