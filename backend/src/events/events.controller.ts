import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List events with seat availability' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.eventsService.findAll(query);
  }
}
