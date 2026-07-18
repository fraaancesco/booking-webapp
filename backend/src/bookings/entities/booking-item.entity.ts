import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Booking } from './booking.entity';

@Entity()
@Unique(['bookingId', 'eventId'])
export class BookingItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  bookingId!: string;

  @ManyToOne(() => Booking, (booking) => booking.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookingId' })
  booking!: Booking;

  @Column({ type: 'uuid' })
  eventId!: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column({ type: 'int' })
  quantity!: number;
}
