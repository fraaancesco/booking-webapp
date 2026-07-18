import { types } from 'pg';

export function registerPgTypeParsers(): void {
  types.setTypeParser(types.builtins.TIMESTAMP, (value: string | null) =>
    value === null ? null : new Date(`${value}Z`),
  );
}
