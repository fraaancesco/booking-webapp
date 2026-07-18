import axiosInstance from './index'
import { AUTH_ENDPOINTS } from './endpoints'
import type {
  AuthCredentials,
  LoginResponseDto,
  RegisterResponseDto,
} from '@/interfaces/auth.interface'

export async function registerRequest(credentials: AuthCredentials) {
  const { data } = await axiosInstance.post<RegisterResponseDto>(
    AUTH_ENDPOINTS.register,
    credentials,
  )
  return data
}

export async function loginRequest(credentials: AuthCredentials) {
  const { data } = await axiosInstance.post<LoginResponseDto>(AUTH_ENDPOINTS.login, credentials)
  return data
}
