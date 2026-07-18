import { LogLevel } from '@nestjs/common';

const LEVEL_HIERARCHY: LogLevel[] = [
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
];

export function logLevelsFrom(level: string): LogLevel[] {
  const index = LEVEL_HIERARCHY.indexOf(level as LogLevel);
  return LEVEL_HIERARCHY.slice(0, index === -1 ? 3 : index + 1);
}
