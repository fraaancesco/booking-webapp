import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: jest.Mocked<EventsService>;

  beforeEach(() => {
    eventsService = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<EventsService>;

    controller = new EventsController(eventsService);
  });

  it('findAll delegates to EventsService.findAll with the query', async () => {
    const query = { page: 1, limit: 10 } as never;
    const paginated = {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    eventsService.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll(query);

    expect(eventsService.findAll).toHaveBeenCalledWith(query);
    expect(result).toBe(paginated);
  });
});
