import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4500),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(12).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'log', 'debug', 'verbose')
    .default('log'),
  CORS_ORIGIN: Joi.string().default('*'),
});
