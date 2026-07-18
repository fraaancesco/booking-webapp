import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let health: jest.Mocked<HealthCheckService>;
  let db: jest.Mocked<TypeOrmHealthIndicator>;

  beforeEach(() => {
    health = {
      check: jest.fn(),
    } as unknown as jest.Mocked<HealthCheckService>;
    db = {
      pingCheck: jest.fn(),
    } as unknown as jest.Mocked<TypeOrmHealthIndicator>;

    controller = new HealthController(health, db);
  });

  it('runs a database ping check', async () => {
    const report = { status: 'ok', info: {}, error: {}, details: {} };
    health.check.mockImplementation(async (indicators) => {
      for (const indicator of indicators) {
        await indicator();
      }
      return report as never;
    });
    db.pingCheck.mockResolvedValue({ database: { status: 'up' } });

    const result = await controller.check();

    expect(db.pingCheck).toHaveBeenCalledWith('database');
    expect(result).toBe(report);
  });
});
