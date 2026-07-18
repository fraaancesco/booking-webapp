import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  eventId!: string;

  @ApiProperty({ minimum: 1, maximum: 3, example: 2 })
  @IsInt()
  @Min(1)
  @Max(3)
  quantity!: number;
}

export class CreateBookingDto {
  @ApiProperty({ type: [BookingItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items!: BookingItemDto[];
}
