import axiosInstance from './index'
import { EVENTS_ENDPOINTS } from './endpoints'
import type { PaginatedResult } from '@/interfaces/paginated-result.interface'
import type { EventDto, GetEventsParams } from '@/interfaces/event.interface'

export async function getEvents(params: GetEventsParams = {}) {
  const { data } = await axiosInstance.get<PaginatedResult<EventDto>>(EVENTS_ENDPOINTS.list, {
    params,
  })
  return data
}
