import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly repo: Repository<Booking>,
  ) {}

  findByUser(userId: string): Promise<Booking[]> {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['room'],
      order: { start_time: 'DESC' },
    });
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.repo.findOne({
      where: { id },
      relations: ['room', 'user'],
    });
    if (!booking) throw new NotFoundException('Reserva não encontrada');
    return booking;
  }

  findAll(): Promise<Booking[]> {
    return this.repo.find({
      relations: ['room', 'user'],
      order: { start_time: 'DESC' },
    });
  }

  private async checkConflict(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.repo
      .createQueryBuilder('b')
      .where('b.room_id = :roomId', { roomId })
      .andWhere('b.status = :status', { status: 'active' })
      .andWhere('b.start_time < :endTime', { endTime })
      .andWhere('b.end_time > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('b.id != :excludeId', { excludeId });
    }

    const conflict = await qb.getOne();
    if (conflict) throw new ConflictException('A sala já está reservada neste horário');
  }

  async create(dto: CreateBookingDto, userId: string): Promise<Booking> {
    const start = new Date(dto.start_time);
    const end = new Date(dto.end_time);
    await this.checkConflict(dto.room_id, start, end);

    const booking = this.repo.create({
      user_id: userId,
      room_id: dto.room_id,
      title: dto.title,
      start_time: start,
      end_time: end,
      notes: dto.notes,
      status: 'active',
    });

    return this.repo.save(booking);
  }

  async update(
    id: string,
    dto: UpdateBookingDto,
    userId: string,
    userRole: string,
  ): Promise<Booking> {
    const booking = await this.findById(id);

    if (userRole !== 'admin' && booking.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para editar esta reserva');
    }

    const start = dto.start_time ? new Date(dto.start_time) : booking.start_time;
    const end = dto.end_time ? new Date(dto.end_time) : booking.end_time;
    const roomId = dto.room_id ?? booking.room_id;

    if (dto.start_time || dto.end_time || dto.room_id) {
      await this.checkConflict(roomId, start, end, id);
    }

    if (dto.room_id) booking.room_id = dto.room_id;
    if (dto.title) booking.title = dto.title;
    if (dto.start_time) booking.start_time = start;
    if (dto.end_time) booking.end_time = end;
    if (dto.notes !== undefined) booking.notes = dto.notes;
    if (dto.status) booking.status = dto.status;

    return this.repo.save(booking);
  }

  async cancel(id: string, userId: string, userRole: string): Promise<void> {
    const booking = await this.findById(id);

    if (userRole !== 'admin' && booking.user_id !== userId) {
      throw new ForbiddenException('Sem permissão para cancelar esta reserva');
    }

    booking.status = 'cancelled';
    await this.repo.save(booking);
  }
}
