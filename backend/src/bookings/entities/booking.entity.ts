import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BookingItem } from './booking-item.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => BookingItem, (item) => item.booking, { cascade: ['insert'] })
  items!: BookingItem[];

  @CreateDateColumn()
  createdAt!: Date;
}
