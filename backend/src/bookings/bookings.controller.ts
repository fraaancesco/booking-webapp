import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Book seats for one or more events (max 3 tickets per event)',
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created, notification sent',
  })
  @ApiResponse({ status: 400, description: 'BOOKING_DUPLICATE_EVENT' })
  @ApiResponse({ status: 404, description: 'BOOKING_EVENT_NOT_FOUND' })
  @ApiResponse({ status: 409, description: 'BOOKING_INSUFFICIENT_SEATS' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(user.userId, user.email, dto.items);
  }

  @Get()
  @ApiOperation({
    summary:
      'List bookings of the current user (paginated, filterable by event name and date range)',
  })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListBookingsQueryDto,
  ) {
    return this.bookingsService.findByUser(user.userId, query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a booking of the current user and release its seats',
  })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 404, description: 'BOOKING_NOT_FOUND' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.bookingsService.remove(user.userId, id);
  }
}
