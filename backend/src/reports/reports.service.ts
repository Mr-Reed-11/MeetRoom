import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Room } from '../rooms/room.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,
    @InjectRepository(Room)
    private readonly roomsRepo: Repository<Room>,
  ) {}

  getAllBookings(): Promise<Booking[]> {
    return this.bookingsRepo.find({
      relations: ['room', 'user'],
      order: { start_time: 'DESC' },
    });
  }

  async getRoomsUsage() {
    const rooms = await this.roomsRepo.find({ order: { name: 'ASC' } });

    return Promise.all(
      rooms.map(async (room) => {
        const bookings = await this.bookingsRepo.find({
          where: { room_id: room.id, status: 'active' },
        });

        const totalHours = bookings.reduce((acc, b) => {
          return acc + (b.end_time.getTime() - b.start_time.getTime()) / 3_600_000;
        }, 0);

        return {
          room_id: room.id,
          room_name: room.name,
          capacity: room.capacity,
          location: room.location,
          is_active: room.is_active,
          total_bookings: bookings.length,
          total_hours: Math.round(totalHours * 100) / 100,
        };
      }),
    );
  }
}
