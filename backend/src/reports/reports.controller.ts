import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
@UseGuards(RolesGuard)
@Roles('admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bookings')
  getAllBookings() {
    return this.reportsService.getAllBookings();
  }

  @Get('rooms/usage')
  getRoomsUsage() {
    return this.reportsService.getRoomsUsage();
  }
}
