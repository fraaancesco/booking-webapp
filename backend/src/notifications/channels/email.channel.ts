import { Injectable, Logger } from '@nestjs/common';
import { BookingConfirmation } from '../booking-confirmation.interface';
import { NotificationChannel } from './notification-channel.interface';

@Injectable()
export class EmailChannel implements NotificationChannel {
  private readonly logger = new Logger(EmailChannel.name);

  send(to: string, confirmation: BookingConfirmation): void {
    const lines = confirmation.items
      .map((item) => `  - ${item.eventName} x${item.quantity}`)
      .join('\n');
    this.logger.log(
      `[SIMULATED EMAIL] to=${to} subject="Conferma prenotazione ${confirmation.bookingId}"\n${lines}`,
    );
  }
}
