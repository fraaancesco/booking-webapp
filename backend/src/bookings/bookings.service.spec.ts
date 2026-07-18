import { DataSource, EntityManager, Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { ErrorCode } from '../common/errors/error-code.enum';
import { NotificationsService } from '../notifications/notifications.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let dataSource: jest.Mocked<DataSource>;
  let manager: jest.Mocked<EntityManager>;
  let bookingsRepository: jest.Mocked<Repository<Booking>>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let updateExecute: jest.Mock;
  let updateWhere: jest.Mock;

  const savedBooking = {
    id: 'booking-1',
    userId: 'user-1',
    items: [{ eventId: 'event-a', quantity: 2, event: { name: 'Concerto' } }],
  } as unknown as Booking;

  beforeEach(() => {
    updateExecute = jest.fn().mockResolvedValue({ affected: 1 });
    updateWhere = jest.fn().mockReturnValue({ execute: updateExecute });
    const queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: updateWhere,
    };

    manager = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOneBy: jest.fn(),
      create: jest.fn((_entity, data: object) => data),
      save: jest.fn().mockResolvedValue(savedBooking),
      findOneOrFail: jest.fn().mockResolvedValue(savedBooking),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest.fn((cb: (m: EntityManager) => unknown) => cb(manager)),
    } as unknown as jest.Mocked<DataSource>;

    bookingsRepository = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<Booking>>;

    notificationsService = {
      sendBookingConfirmation: jest.fn(),
    } as unknown as jest.Mocked<NotificationsService>;

    service = new BookingsService(
      dataSource,
      bookingsRepository,
      notificationsService,
    );
  });

  it('rejects duplicate events in the same booking without opening a transaction', async () => {
    await expect(
      service.create('user-1', 'a@a.com', [
        { eventId: 'event-a', quantity: 1 },
        { eventId: 'event-a', quantity: 2 },
      ]),
    ).rejects.toMatchObject({
      response: { code: ErrorCode.BOOKING_DUPLICATE_EVENT },
    });
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('throws BOOKING_INSUFFICIENT_SEATS when the conditional decrement affects no rows but the event exists', async () => {
    updateExecute.mockResolvedValue({ affected: 0 });
    manager.findOneBy.mockResolvedValue({ id: 'event-a' });

    await expect(
      service.create('user-1', 'a@a.com', [
        { eventId: 'event-a', quantity: 3 },
      ]),
    ).rejects.toMatchObject({
      response: { code: ErrorCode.BOOKING_INSUFFICIENT_SEATS },
    });
    expect(notificationsService.sendBookingConfirmation).not.toHaveBeenCalled();
  });

  it('throws BOOKING_EVENT_NOT_FOUND when the event does not exist', async () => {
    updateExecute.mockResolvedValue({ affected: 0 });
    manager.findOneBy.mockResolvedValue(null);

    await expect(
      service.create('user-1', 'a@a.com', [
        { eventId: 'missing', quantity: 1 },
      ]),
    ).rejects.toMatchObject({
      response: { code: ErrorCode.BOOKING_EVENT_NOT_FOUND },
    });
  });

  it('creates the booking and sends the confirmation on success', async () => {
    const result = await service.create('user-1', 'a@a.com', [
      { eventId: 'event-a', quantity: 2 },
    ]);

    expect(result).toBe(savedBooking);
    expect(notificationsService.sendBookingConfirmation).toHaveBeenCalledWith(
      'a@a.com',
      {
        bookingId: 'booking-1',
        items: [{ eventName: 'Concerto', quantity: 2 }],
      },
    );
  });

  it('locks events in deterministic eventId order regardless of input order', async () => {
    await service.create('user-1', 'a@a.com', [
      { eventId: 'event-z', quantity: 1 },
      { eventId: 'event-a', quantity: 1 },
    ]);

    const calls = updateWhere.mock.calls as [string, { eventId: string }][];
    expect(calls[0][1].eventId).toBe('event-a');
    expect(calls[1][1].eventId).toBe('event-z');
  });

  it('retries once on a Postgres deadlock error', async () => {
    updateExecute
      .mockRejectedValueOnce(
        Object.assign(new Error('deadlock'), { code: '40P01' }),
      )
      .mockResolvedValue({ affected: 1 });

    const result = await service.create('user-1', 'a@a.com', [
      { eventId: 'event-a', quantity: 1 },
    ]);

    expect(result).toBe(savedBooking);
    expect(dataSource.transaction).toHaveBeenCalledTimes(2);
  });
});
