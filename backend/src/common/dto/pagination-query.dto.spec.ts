import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('defaults page and limit when omitted', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('accepts valid page/limit within bounds', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: '2', limit: '50' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(50);
  });

  it('rejects page below 1', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: '0' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects limit above 100', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: '101' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('rejects a non-integer limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: '2.5' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });
});
