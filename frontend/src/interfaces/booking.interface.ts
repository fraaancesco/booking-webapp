import type { EventDto } from './event.interface'

export interface BookingItemInput {
  eventId: string
  quantity: number
}

export interface BookingItemDto {
  id: string
  eventId: string
  quantity: number
  event: EventDto
}

export interface BookingDto {
  id: string
  createdAt: string
  items: BookingItemDto[]
}

export interface GetMyBookingsParams {
  page?: number
  limit?: number
  search?: string
  dateFrom?: string
  dateTo?: string
}
