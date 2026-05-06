import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsUUID()
  room_id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['active', 'cancelled'])
  status?: 'active' | 'cancelled';
}
