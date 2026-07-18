export const AUTH_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
} as const

export const EVENTS_ENDPOINTS = {
  list: '/events',
} as const

export const BOOKINGS_ENDPOINTS = {
  create: '/bookings',
  listMine: '/bookings',
  remove: (id: string) => `/bookings/${id}`,
} as const
