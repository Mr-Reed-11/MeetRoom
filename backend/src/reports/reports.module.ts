import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Booking } from '../bookings/booking.entity';
import { Room } from '../rooms/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Room])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
