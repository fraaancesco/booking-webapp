export interface EventDto {
  id: string
  name: string
  description: string | null
  date: string
  totalSeats: number
  availableSeats: number
}

export interface GetEventsParams {
  page?: number
  limit?: number
}
