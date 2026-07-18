import { ApiProperty } from '@nestjs/swagger';

export class GenericResponseDto<T = unknown> {
  @ApiProperty()
  success!: boolean;

  @ApiProperty({ nullable: true, type: String })
  errorMessage!: string | null;

  @ApiProperty({ nullable: true })
  data!: T | null;
}
