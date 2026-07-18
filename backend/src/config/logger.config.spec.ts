import { logLevelsFrom } from './logger.config';

describe('logLevelsFrom', () => {
  it('returns levels up to and including the requested one', () => {
    expect(logLevelsFrom('warn')).toEqual(['error', 'warn']);
  });

  it('returns the full hierarchy for verbose', () => {
    expect(logLevelsFrom('verbose')).toEqual([
      'error',
      'warn',
      'log',
      'debug',
      'verbose',
    ]);
  });

  it('returns only error for the lowest level', () => {
    expect(logLevelsFrom('error')).toEqual(['error']);
  });

  it('falls back to error/warn/log for an unknown level', () => {
    expect(logLevelsFrom('nonsense')).toEqual(['error', 'warn', 'log']);
  });
});
