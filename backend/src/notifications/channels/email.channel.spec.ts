import { EmailChannel } from './email.channel';

describe('EmailChannel', () => {
  it('logs the simulated email with booking details', () => {
    const channel = new EmailChannel();
    const logger = (channel as unknown as { logger: { log: jest.Mock } })
      .logger;
    const logSpy = jest
      .spyOn(logger, 'log')
      .mockImplementation(() => undefined);

    channel.send('a@a.com', {
      bookingId: 'booking-1',
      items: [{ eventName: 'Concerto', quantity: 2 }],
    });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('to=a@a.com'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Concerto x2'));
  });
});
