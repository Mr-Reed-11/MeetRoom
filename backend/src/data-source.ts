import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Room } from './rooms/room.entity';
import { Booking } from './bookings/booking.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Room, Booking],
  migrations: ['src/migrations/*.ts'],
});
