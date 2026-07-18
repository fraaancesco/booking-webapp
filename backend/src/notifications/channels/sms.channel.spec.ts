import { SmsChannel } from './sms.channel';

describe('SmsChannel', () => {
  it('logs the simulated SMS with the total seat count', () => {
    const channel = new SmsChannel();
    const logger = (channel as unknown as { logger: { log: jest.Mock } })
      .logger;
    const logSpy = jest
      .spyOn(logger, 'log')
      .mockImplementation(() => undefined);

    channel.send('+391234567890', {
      bookingId: 'booking-1',
      items: [
        { eventName: 'Concerto', quantity: 2 },
        { eventName: 'Teatro', quantity: 1 },
      ],
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('to=+391234567890'),
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('(3 posti)'));
  });
});
