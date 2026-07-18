import type { ValidationResult } from 'joi';
import { envValidationSchema } from './env.validation';

function validate(value: Record<string, unknown>): ValidationResult {
  return envValidationSchema.validate(value);
}

describe('envValidationSchema', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5433/db',
    JWT_SECRET: 'a-secret-of-12-chars',
  };

  it('accepts a minimal valid env and applies defaults', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Joi's ObjectSchema.validate() typing resolves loosely here
    const { error, value } = validate(validEnv);

    expect(error).toBeUndefined();
    expect(value).toMatchObject({
      NODE_ENV: 'development',
      PORT: 4500,
      JWT_EXPIRES_IN: '1d',
      LOG_LEVEL: 'log',
      CORS_ORIGIN: '*',
    });
  });

  it('fails when DATABASE_URL is missing', () => {
    const { error } = validate({
      JWT_SECRET: 'a-secret-of-12-chars',
    });

    expect(error).toBeDefined();
  });

  it('fails when JWT_SECRET is shorter than 12 characters', () => {
    const { error } = validate({
      ...validEnv,
      JWT_SECRET: 'short',
    });

    expect(error).toBeDefined();
  });

  it('fails for an invalid NODE_ENV value', () => {
    const { error } = validate({
      ...validEnv,
      NODE_ENV: 'staging',
    });

    expect(error).toBeDefined();
  });
});
