import { Injectable } from '@nestjs/common';
import { BookingConfirmation } from './booking-confirmation.interface';
import { NotificationChannelType } from './notification-channel-type.enum';
import { EmailChannel } from './channels/email.channel';
import { SmsChannel } from './channels/sms.channel';
import { NotificationChannel } from './channels/notification-channel.interface';

export type { BookingConfirmation } from './booking-confirmation.interface';
export { NotificationChannelType } from './notification-channel-type.enum';

@Injectable()
export class NotificationsService {
  private readonly channels: Record<
    NotificationChannelType,
    NotificationChannel
  >;

  constructor(emailChannel: EmailChannel, smsChannel: SmsChannel) {
    this.channels = {
      [NotificationChannelType.EMAIL]: emailChannel,
      [NotificationChannelType.SMS]: smsChannel,
    };
  }

  sendBookingConfirmation(
    to: string,
    confirmation: BookingConfirmation,
    channel: NotificationChannelType = NotificationChannelType.EMAIL,
  ): void {
    this.channels[channel].send(to, confirmation);
  }
}
