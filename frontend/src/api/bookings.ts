import axiosInstance from './index'
import { BOOKINGS_ENDPOINTS } from './endpoints'
import type { PaginatedResult } from '@/interfaces/paginated-result.interface'
import type {
  BookingItemInput,
  BookingDto,
  GetMyBookingsParams,
} from '@/interfaces/booking.interface'

export async function createBooking(items: BookingItemInput[]) {
  const { data } = await axiosInstance.post<BookingDto>(BOOKINGS_ENDPOINTS.create, { items })
  return data
}

export async function getMyBookings(params: GetMyBookingsParams = {}) {
  const { data } = await axiosInstance.get<PaginatedResult<BookingDto>>(
    BOOKINGS_ENDPOINTS.listMine,
    { params },
  )
  return data
}

export async function deleteBooking(id: string) {
  await axiosInstance.delete(BOOKINGS_ENDPOINTS.remove(id))
}
