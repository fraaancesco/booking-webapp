export interface GenericResponse<T> {
  success: boolean
  errorMessage: string | null
  data: T | null
}
