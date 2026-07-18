import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { ErrorCode } from '../src/common/errors/error-code.enum';
import { Event } from '../src/events/entities/event.entity';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  const createdEventIds: string[] = [];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    if (createdEventIds.length > 0) {
      await dataSource.query(
        'DELETE FROM booking_item WHERE "eventId" = ANY($1)',
        [createdEventIds],
      );
      await dataSource.query('DELETE FROM event WHERE id = ANY($1)', [
        createdEventIds,
      ]);
      createdEventIds.length = 0;
    }
    await app.close();
  });

  async function createTestEvent(availableSeats: number): Promise<string> {
    const event = await dataSource.getRepository(Event).save({
      name: `e2e-event-${Date.now()}-${Math.random()}`,
      description: null,
      date: new Date(Date.now() + 86_400_000),
      totalSeats: availableSeats,
      availableSeats,
    });
    createdEventIds.push(event.id);
    return event.id;
  }

  async function registerAndLogin(): Promise<string> {
    const email = `e2e-${Date.now()}-${Math.random()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'password123' })
      .expect(200);
    return (loginRes.body as { data: { access_token: string } }).data
      .access_token;
  }

  it('/health (GET) is public and reports database status wrapped in GenericResponseDto', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as {
          success: boolean;
          errorMessage: string | null;
          data: { status: string };
        };
        expect(body.success).toBe(true);
        expect(body.errorMessage).toBeNull();
        expect(body.data.status).toBe('ok');
      });
  });

  it('/auth/register then /auth/login issues a usable token', async () => {
    const email = `e2e-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'password123' })
      .expect(200);

    const body = loginRes.body as {
      success: boolean;
      data: { access_token?: string };
    };
    expect(body.success).toBe(true);
    expect(body.data.access_token).toBeDefined();
  });

  it('returns a GenericResponseDto error shape with a translatable code on invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' })
      .expect(401)
      .expect((res: request.Response) => {
        const body = res.body as { success: boolean; errorMessage: string };
        expect(body.success).toBe(false);
        expect(body.errorMessage).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      });
  });

  it('returns AUTH_EMAIL_ALREADY_REGISTERED code on duplicate registration', async () => {
    const email = `e2e-dup-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);

    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'password123' })
      .expect(409)
      .expect((res: request.Response) => {
        const body = res.body as { success: boolean; errorMessage: string };
        expect(body.success).toBe(false);
        expect(body.errorMessage).toBe(ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED);
      });
  });

  it('returns VALIDATION_ERROR code on malformed payload', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400)
      .expect((res: request.Response) => {
        const body = res.body as { success: boolean; errorMessage: string };
        expect(body.success).toBe(false);
        expect(body.errorMessage).toBe(ErrorCode.VALIDATION_ERROR);
      });
  });

  describe('bookings', () => {
    it('GET /events is public and lists events with availability', async () => {
      const eventId = await createTestEvent(10);

      const res = await request(app.getHttpServer())
        .get('/api/events')
        .expect(200);

      const body = res.body as {
        success: boolean;
        data: { id: string; availableSeats: number }[];
      };
      expect(body.success).toBe(true);
      const created = body.data.find((e) => e.id === eventId);
      expect(created?.availableSeats).toBe(10);
    });

    it('POST /bookings requires authentication', async () => {
      const eventId = await createTestEvent(5);
      return request(app.getHttpServer())
        .post('/api/bookings')
        .send({ items: [{ eventId, quantity: 1 }] })
        .expect(401);
    });

    it('books multiple events atomically, decrements seats, sends notification, and lists them', async () => {
      const token = await registerAndLogin();
      const eventA = await createTestEvent(10);
      const eventB = await createTestEvent(5);

      await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            { eventId: eventA, quantity: 2 },
            { eventId: eventB, quantity: 3 },
          ],
        })
        .expect(201);

      const eventsRes = await request(app.getHttpServer())
        .get('/api/events')
        .expect(200);
      const events = (
        eventsRes.body as { data: { id: string; availableSeats: number }[] }
      ).data;
      expect(events.find((e) => e.id === eventA)?.availableSeats).toBe(8);
      expect(events.find((e) => e.id === eventB)?.availableSeats).toBe(2);

      const bookingsRes = await request(app.getHttpServer())
        .get('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const bookings = (
        bookingsRes.body as {
          data: { items: { eventId: string; quantity: number }[] }[];
        }
      ).data;
      expect(bookings).toHaveLength(1);
      expect(bookings[0].items).toHaveLength(2);
    });

    it('rejects more than 3 tickets per event with VALIDATION_ERROR', async () => {
      const token = await registerAndLogin();
      const eventId = await createTestEvent(10);

      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ eventId, quantity: 4 }] })
        .expect(400)
        .expect((res: request.Response) => {
          expect((res.body as { errorMessage: string }).errorMessage).toBe(
            ErrorCode.VALIDATION_ERROR,
          );
        });
    });

    it('rejects duplicate events in the same transaction', async () => {
      const token = await registerAndLogin();
      const eventId = await createTestEvent(10);

      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            { eventId, quantity: 1 },
            { eventId, quantity: 2 },
          ],
        })
        .expect(400)
        .expect((res: request.Response) => {
          expect((res.body as { errorMessage: string }).errorMessage).toBe(
            ErrorCode.BOOKING_DUPLICATE_EVENT,
          );
        });
    });

    it('returns BOOKING_EVENT_NOT_FOUND for a nonexistent event', async () => {
      const token = await registerAndLogin();

      return request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            { eventId: '00000000-0000-4000-8000-000000000000', quantity: 1 },
          ],
        })
        .expect(404)
        .expect((res: request.Response) => {
          expect((res.body as { errorMessage: string }).errorMessage).toBe(
            ErrorCode.BOOKING_EVENT_NOT_FOUND,
          );
        });
    });

    it('rolls back the whole transaction when one event lacks seats (all-or-nothing)', async () => {
      const token = await registerAndLogin();
      const eventOk = await createTestEvent(10);
      const eventFull = await createTestEvent(1);

      await request(app.getHttpServer())
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            { eventId: eventOk, quantity: 2 },
            { eventId: eventFull, quantity: 3 },
          ],
        })
        .expect(409)
        .expect((res: request.Response) => {
          expect((res.body as { errorMessage: string }).errorMessage).toBe(
            ErrorCode.BOOKING_INSUFFICIENT_SEATS,
          );
        });

      const eventsRes = await request(app.getHttpServer()).get('/api/events');
      const events = (
        eventsRes.body as { data: { id: string; availableSeats: number }[] }
      ).data;
      expect(events.find((e) => e.id === eventOk)?.availableSeats).toBe(10);
      expect(events.find((e) => e.id === eventFull)?.availableSeats).toBe(1);
    });

    it('never oversells under concurrency: N parallel bookings on 1 seat, exactly one succeeds', async () => {
      const token = await registerAndLogin();
      const eventId = await createTestEvent(1);

      const attempts = await Promise.all(
        Array.from({ length: 5 }, () =>
          request(app.getHttpServer())
            .post('/api/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({ items: [{ eventId, quantity: 1 }] }),
        ),
      );

      const succeeded = attempts.filter((r) => r.status === 201);
      const conflicted = attempts.filter((r) => r.status === 409);
      expect(succeeded).toHaveLength(1);
      expect(conflicted).toHaveLength(4);

      const eventsRes = await request(app.getHttpServer()).get('/api/events');
      const events = (
        eventsRes.body as { data: { id: string; availableSeats: number }[] }
      ).data;
      expect(events.find((e) => e.id === eventId)?.availableSeats).toBe(0);
    });

    it('does not deadlock on crossed multi-event bookings ([a,b] vs [b,a])', async () => {
      const token = await registerAndLogin();
      const eventA = await createTestEvent(50);
      const eventB = await createTestEvent(50);

      const rounds = Array.from({ length: 10 }, () =>
        Promise.all([
          request(app.getHttpServer())
            .post('/api/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({
              items: [
                { eventId: eventA, quantity: 1 },
                { eventId: eventB, quantity: 1 },
              ],
            }),
          request(app.getHttpServer())
            .post('/api/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({
              items: [
                { eventId: eventB, quantity: 1 },
                { eventId: eventA, quantity: 1 },
              ],
            }),
        ]),
      );
      const results = (await Promise.all(rounds)).flat();

      expect(results.every((r) => r.status === 201)).toBe(true);

      const eventsRes = await request(app.getHttpServer()).get('/api/events');
      const events = (
        eventsRes.body as { data: { id: string; availableSeats: number }[] }
      ).data;
      expect(events.find((e) => e.id === eventA)?.availableSeats).toBe(30);
      expect(events.find((e) => e.id === eventB)?.availableSeats).toBe(30);
    });
  });
});
