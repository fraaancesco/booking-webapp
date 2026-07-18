import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: jest.Mocked<BookingsService>;

  const user: AuthenticatedUser = { userId: 'user-1', email: 'a@a.com' };

  beforeEach(() => {
    bookingsService = {
      create: jest.fn(),
      findByUser: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<BookingsService>;

    controller = new BookingsController(bookingsService);
  });

  it('create delegates to BookingsService.create with userId/email/items', () => {
    const items = [{ eventId: 'event-a', quantity: 2 }];
    void controller.create(user, { items });

    expect(bookingsService.create).toHaveBeenCalledWith(
      'user-1',
      'a@a.com',
      items,
    );
  });

  it('findMine delegates to BookingsService.findByUser with userId and query', () => {
    const query = { page: 1, limit: 10 } as never;
    void controller.findMine(user, query);

    expect(bookingsService.findByUser).toHaveBeenCalledWith('user-1', query);
  });

  it('remove delegates to BookingsService.remove with userId and booking id', () => {
    void controller.remove(user, 'booking-1');

    expect(bookingsService.remove).toHaveBeenCalledWith('user-1', 'booking-1');
  });
});
