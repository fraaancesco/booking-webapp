import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListBookingsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by event name (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'ISO 8601 date, inclusive lower bound on booking createdAt',
  })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'ISO 8601 date, inclusive upper bound on booking createdAt',
  })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}
