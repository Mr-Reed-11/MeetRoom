import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'room_id' })
  room_id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  start_time: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  end_time: Date;

  @Column({ type: 'enum', enum: ['active', 'cancelled'], default: 'active' })
  status: 'active' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: 'room_id' })
  room: Room;
}
