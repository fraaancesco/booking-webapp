import { types } from 'pg';
import { registerPgTypeParsers } from './pg-type-parser';

describe('registerPgTypeParsers', () => {
  it('registers a TIMESTAMP parser that appends Z to force UTC interpretation', () => {
    const setTypeParserSpy = jest.spyOn(types, 'setTypeParser');

    registerPgTypeParsers();

    expect(setTypeParserSpy).toHaveBeenCalledWith(
      types.builtins.TIMESTAMP,
      expect.any(Function),
    );

    const parser = setTypeParserSpy.mock.calls[0][1] as (
      value: string | null,
    ) => Date | null;

    expect(parser('2026-07-18 09:38:29.623')).toEqual(
      new Date('2026-07-18 09:38:29.623Z'),
    );
    expect(parser(null)).toBeNull();

    setTypeParserSpy.mockRestore();
  });
});
