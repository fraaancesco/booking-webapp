import { BookingConfirmation } from '../booking-confirmation.interface';

export interface NotificationChannel {
  send(to: string, confirmation: BookingConfirmation): void;
}
