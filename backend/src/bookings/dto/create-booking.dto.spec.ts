import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

describe('CreateBookingDto', () => {
  it('accepts a valid list of booking items', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      items: [{ eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', quantity: 2 }],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty items array', async () => {
    const dto = plainToInstance(CreateBookingDto, { items: [] });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'items')).toBe(true);
  });

  it('rejects an item with a non-UUID eventId', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      items: [{ eventId: 'not-a-uuid', quantity: 1 }],
    });

    const errors = await validate(dto, { forbidUnknownValues: false });

    const itemErrors = errors[0]?.children?.[0]?.children ?? [];
    expect(itemErrors.some((e) => e.property === 'eventId')).toBe(true);
  });

  it('rejects a quantity above the max of 3', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      items: [{ eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', quantity: 4 }],
    });

    const errors = await validate(dto, { forbidUnknownValues: false });

    const itemErrors = errors[0]?.children?.[0]?.children ?? [];
    expect(itemErrors.some((e) => e.property === 'quantity')).toBe(true);
  });

  it('rejects a quantity below the min of 1', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      items: [{ eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', quantity: 0 }],
    });

    const errors = await validate(dto, { forbidUnknownValues: false });

    const itemErrors = errors[0]?.children?.[0]?.children ?? [];
    expect(itemErrors.some((e) => e.property === 'quantity')).toBe(true);
  });
});
