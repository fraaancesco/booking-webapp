import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'int' })
  totalSeats!: number;

  @Column({ type: 'int' })
  availableSeats!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
