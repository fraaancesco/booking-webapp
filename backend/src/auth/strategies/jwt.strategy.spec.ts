import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('throws if JWT_SECRET is not configured', () => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(config)).toThrow(
      'JWT_SECRET is not configured',
    );
  });

  it('constructs successfully when JWT_SECRET is configured', () => {
    const config = {
      get: jest.fn().mockReturnValue('a-very-long-secret-value'),
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(config)).not.toThrow();
  });

  it('validate maps the JWT payload to userId/email', () => {
    const config = {
      get: jest.fn().mockReturnValue('a-very-long-secret-value'),
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);

    const result = strategy.validate({ sub: 'user-1', email: 'a@a.com' });

    expect(result).toEqual({ userId: 'user-1', email: 'a@a.com' });
  });
});
