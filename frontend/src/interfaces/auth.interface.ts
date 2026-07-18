export interface AuthCredentials {
  email: string
  password: string
}

export interface LoginResponseDto {
  access_token: string
}

export interface RegisterResponseDto {
  id: string
  email: string
}
