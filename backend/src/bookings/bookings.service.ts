import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code.enum';
import { Event } from '../events/entities/event.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Booking } from './entities/booking.entity';
import { BookingItem } from './entities/booking-item.entity';
import { BookingItemDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';

const PG_DEADLOCK_DETECTED = '40P01';
const PG_SERIALIZATION_FAILURE = '40001';

function isRetryableTxError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === PG_DEADLOCK_DETECTED || code === PG_SERIALIZATION_FAILURE;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, userEmail: string, items: BookingItemDto[]) {
    this.assertNoDuplicateEvents(items);

    const sortedItems = [...items].sort((a, b) =>
      a.eventId.localeCompare(b.eventId),
    );

    let booking: Booking;
    try {
      booking = await this.createInTransaction(userId, sortedItems);
    } catch (error) {
      if (!isRetryableTxError(error)) {
        throw error;
      }
      this.logger.warn('Retrying booking after transient transaction error');
      booking = await this.createInTransaction(userId, sortedItems);
    }

    this.notificationsService.sendBookingConfirmation(userEmail, {
      bookingId: booking.id,
      items: booking.items.map((item) => ({
        eventName: item.event.name,
        quantity: item.quantity,
      })),
    });

    return booking;
  }

  async findByUser(
    userId: string,
    query: ListBookingsQueryDto,
  ): Promise<PaginatedResult<Booking>> {
    const { page, limit, search, dateFrom, dateTo } = query;

    const applyFilters = (
      qb: ReturnType<typeof this.bookingsRepository.createQueryBuilder>,
    ) => {
      qb.leftJoin('booking.items', 'item')
        .leftJoin('item.event', 'event')
        .where('booking.userId = :userId', { userId });
      if (search) {
        qb.andWhere('event.name ILIKE :search', { search: `%${search}%` });
      }
      if (dateFrom) {
        qb.andWhere('booking.createdAt >= :dateFrom', { dateFrom });
      }
      if (dateTo) {
        qb.andWhere('booking.createdAt <= :dateTo', { dateTo });
      }
      return qb;
    };

    const countRow = await applyFilters(
      this.bookingsRepository.createQueryBuilder('booking'),
    )
      .select('COUNT(DISTINCT booking.id)', 'count')
      .getRawOne<{ count: string }>();
    const total = Number(countRow?.count ?? 0);

    const idRows = await applyFilters(
      this.bookingsRepository.createQueryBuilder('booking'),
    )
      .select('booking.id', 'id')
      .addSelect('booking.createdAt', 'createdAt')
      .distinct(true)
      .orderBy('booking.createdAt', 'DESC')
      .addOrderBy('booking.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string }>();
    const ids = idRows.map((row) => row.id);

    const items = ids.length
      ? await this.bookingsRepository.find({
          where: { id: In(ids) },
          relations: { items: { event: true } },
        })
      : [];
    const byId = new Map(items.map((booking) => [booking.id, booking]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((booking): booking is Booking => booking !== undefined);

    return {
      items: ordered,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async remove(userId: string, bookingId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId, userId },
        relations: { items: true },
      });
      if (!booking) {
        throw new AppException(
          ErrorCode.BOOKING_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const item of booking.items) {
        await manager
          .createQueryBuilder()
          .update(Event)
          .set({ availableSeats: () => '"availableSeats" + :quantity' })
          .where('id = :eventId', {
            eventId: item.eventId,
            quantity: item.quantity,
          })
          .execute();
      }

      await manager.remove(Booking, booking);
    });
  }

  private assertNoDuplicateEvents(items: BookingItemDto[]): void {
    const eventIds = new Set(items.map((item) => item.eventId));
    if (eventIds.size !== items.length) {
      throw new AppException(
        ErrorCode.BOOKING_DUPLICATE_EVENT,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private createInTransaction(
    userId: string,
    sortedItems: BookingItemDto[],
  ): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      for (const item of sortedItems) {
        await this.reserveSeats(manager, item);
      }

      const booking = manager.create(Booking, {
        userId,
        items: sortedItems.map((item) =>
          manager.create(BookingItem, {
            eventId: item.eventId,
            quantity: item.quantity,
          }),
        ),
      });
      const saved = await manager.save(booking);

      return manager.findOneOrFail(Booking, {
        where: { id: saved.id },
        relations: { items: { event: true } },
      });
    });
  }

  private async reserveSeats(
    manager: EntityManager,
    item: BookingItemDto,
  ): Promise<void> {
    const result = await manager
      .createQueryBuilder()
      .update(Event)
      .set({ availableSeats: () => '"availableSeats" - :quantity' })
      .where('id = :eventId AND "availableSeats" >= :quantity', {
        eventId: item.eventId,
        quantity: item.quantity,
      })
      .execute();

    if (result.affected === 0) {
      const event = await manager.findOneBy(Event, { id: item.eventId });
      if (!event) {
        throw new AppException(
          ErrorCode.BOOKING_EVENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new AppException(
        ErrorCode.BOOKING_INSUFFICIENT_SEATS,
        HttpStatus.CONFLICT,
      );
    }
  }
}
