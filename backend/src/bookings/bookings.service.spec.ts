import { DataSource, EntityManager, Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { ErrorCode } from '../common/errors/error-code.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';

function makeSelectQueryBuilder(overrides: {
  rawOne?: { count: string };
  rawMany?: { id: string }[];
}) {
  const qb = {
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(overrides.rawOne),
    getRawMany: jest.fn().mockResolvedValue(overrides.rawMany ?? []),
  };
  return qb;
}

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
      findOne: jest.fn(),
      create: jest.fn((_entity, data: object) => data),
      save: jest.fn().mockResolvedValue(savedBooking),
      findOneOrFail: jest.fn().mockResolvedValue(savedBooking),
      remove: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest.fn((cb: (m: EntityManager) => unknown) => cb(manager)),
    } as unknown as jest.Mocked<DataSource>;

    bookingsRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
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

  describe('findByUser', () => {
    const baseQuery: ListBookingsQueryDto = {
      page: 1,
      limit: 10,
    };

    it('returns paginated, ordered bookings for the user with no filters', async () => {
      const countQb = makeSelectQueryBuilder({ rawOne: { count: '1' } });
      const listQb = makeSelectQueryBuilder({
        rawMany: [{ id: 'booking-1' }],
      });
      bookingsRepository.createQueryBuilder
        .mockReturnValueOnce(countQb as never)
        .mockReturnValueOnce(listQb as never);
      bookingsRepository.find.mockResolvedValue([savedBooking]);

      const result = await service.findByUser('user-1', baseQuery);

      expect(countQb.where).toHaveBeenCalledWith('booking.userId = :userId', {
        userId: 'user-1',
      });
      expect(countQb.andWhere).not.toHaveBeenCalled();
      expect(bookingsRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() as unknown },
        relations: { items: { event: true } },
      });
      expect(result).toEqual({
        items: [savedBooking],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('applies search and date range filters when provided', async () => {
      const countQb = makeSelectQueryBuilder({ rawOne: { count: '0' } });
      const listQb = makeSelectQueryBuilder({ rawMany: [] });
      bookingsRepository.createQueryBuilder
        .mockReturnValueOnce(countQb as never)
        .mockReturnValueOnce(listQb as never);

      const result = await service.findByUser('user-1', {
        page: 1,
        limit: 10,
        search: 'Concerto',
        dateFrom: '2026-01-01T00:00:00.000Z',
        dateTo: '2026-12-31T23:59:59.000Z',
      });

      expect(countQb.andWhere).toHaveBeenCalledWith(
        'event.name ILIKE :search',
        { search: '%Concerto%' },
      );
      expect(countQb.andWhere).toHaveBeenCalledWith(
        'booking.createdAt >= :dateFrom',
        { dateFrom: '2026-01-01T00:00:00.000Z' },
      );
      expect(countQb.andWhere).toHaveBeenCalledWith(
        'booking.createdAt <= :dateTo',
        { dateTo: '2026-12-31T23:59:59.000Z' },
      );
      expect(bookingsRepository.find).not.toHaveBeenCalled();
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('throws BOOKING_NOT_FOUND when the booking does not belong to the user or does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.remove('user-1', 'missing-booking'),
      ).rejects.toMatchObject({
        response: { code: ErrorCode.BOOKING_NOT_FOUND },
      });
      expect(manager.remove).not.toHaveBeenCalled();
    });

    it('restores seats for every item and deletes the booking', async () => {
      manager.findOne.mockResolvedValue(savedBooking);

      await service.remove('user-1', 'booking-1');

      expect(updateWhere).toHaveBeenCalledWith('id = :eventId', {
        eventId: 'event-a',
        quantity: 2,
      });
      expect(manager.remove).toHaveBeenCalledWith(Booking, savedBooking);
    });

    it('restores seats for every item of a multi-item booking', async () => {
      const multiItemBooking = {
        id: 'booking-2',
        userId: 'user-1',
        items: [
          { eventId: 'event-a', quantity: 1 },
          { eventId: 'event-b', quantity: 2 },
        ],
      } as unknown as Booking;
      manager.findOne.mockResolvedValue(multiItemBooking);

      await service.remove('user-1', 'booking-2');

      expect(updateWhere).toHaveBeenCalledWith('id = :eventId', {
        eventId: 'event-a',
        quantity: 1,
      });
      expect(updateWhere).toHaveBeenCalledWith('id = :eventId', {
        eventId: 'event-b',
        quantity: 2,
      });
      expect(manager.remove).toHaveBeenCalledWith(Booking, multiItemBooking);
    });
  });
});
