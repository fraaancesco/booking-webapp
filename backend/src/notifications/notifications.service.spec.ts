import { NotificationsService } from './notifications.service';
import { NotificationChannelType } from './notification-channel-type.enum';
import { EmailChannel } from './channels/email.channel';
import { SmsChannel } from './channels/sms.channel';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let emailChannel: jest.Mocked<EmailChannel>;
  let smsChannel: jest.Mocked<SmsChannel>;

  const confirmation = {
    bookingId: 'booking-1',
    items: [{ eventName: 'Concerto', quantity: 2 }],
  };

  beforeEach(() => {
    emailChannel = { send: jest.fn() } as unknown as jest.Mocked<EmailChannel>;
    smsChannel = { send: jest.fn() } as unknown as jest.Mocked<SmsChannel>;

    service = new NotificationsService(emailChannel, smsChannel);
  });

  it('defaults to the email channel when none is specified', () => {
    service.sendBookingConfirmation('a@a.com', confirmation);

    expect(emailChannel.send).toHaveBeenCalledWith('a@a.com', confirmation);
    expect(smsChannel.send).not.toHaveBeenCalled();
  });

  it('dispatches to the SMS channel when explicitly requested', () => {
    service.sendBookingConfirmation(
      '+391234567890',
      confirmation,
      NotificationChannelType.SMS,
    );

    expect(smsChannel.send).toHaveBeenCalledWith('+391234567890', confirmation);
    expect(emailChannel.send).not.toHaveBeenCalled();
  });
});
