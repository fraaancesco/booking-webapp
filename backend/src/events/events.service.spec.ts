import { Repository } from 'typeorm';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';

describe('EventsService', () => {
  let service: EventsService;
  let repository: jest.Mocked<Repository<Event>>;

  beforeEach(() => {
    repository = {
      findAndCount: jest.fn(),
    } as unknown as jest.Mocked<Repository<Event>>;

    service = new EventsService(repository);
  });

  it('returns paginated events ordered by date ascending', async () => {
    const events = [{ id: 'event-1' } as Event];
    repository.findAndCount.mockResolvedValue([events, 1]);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(repository.findAndCount).toHaveBeenCalledWith({
      order: { date: 'ASC' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      items: events,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('computes the correct offset for subsequent pages', async () => {
    repository.findAndCount.mockResolvedValue([[], 25]);

    const result = await service.findAll({ page: 3, limit: 10 });

    expect(repository.findAndCount).toHaveBeenCalledWith({
      order: { date: 'ASC' },
      skip: 20,
      take: 10,
    });
    expect(result.totalPages).toBe(3);
  });
});
