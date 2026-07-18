import { Injectable, Logger } from '@nestjs/common';
import { BookingConfirmation } from '../booking-confirmation.interface';
import { NotificationChannel } from './notification-channel.interface';

@Injectable()
export class SmsChannel implements NotificationChannel {
  private readonly logger = new Logger(SmsChannel.name);

  send(to: string, confirmation: BookingConfirmation): void {
    const itemsCount = confirmation.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    this.logger.log(
      `[SIMULATED SMS] to=${to} body="Prenotazione ${confirmation.bookingId} confermata (${itemsCount} posti)"`,
    );
  }
}
