import axios from 'axios'
import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/constants'
import { ApiError } from './api-error'
import type { GenericResponse } from '@/interfaces/generic-response.interface'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data as GenericResponse<unknown>
    response.data = body.data
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError<GenericResponse<unknown>>(error) && error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      }
      const code = error.response.data?.errorMessage ?? 'INTERNAL_ERROR'
      return Promise.reject(new ApiError(code, error.response.status))
    }
    return Promise.reject(new ApiError('NETWORK_ERROR', 0))
  },
)

export default axiosInstance
