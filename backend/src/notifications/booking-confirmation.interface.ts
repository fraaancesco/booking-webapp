export interface BookingConfirmation {
  bookingId: string;
  items: { eventName: string; quantity: number }[];
}
