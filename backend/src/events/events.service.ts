import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../common/dto/paginated-result.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Event>> {
    const { page, limit } = query;
    const [items, total] = await this.eventsRepository.findAndCount({
      order: { date: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
