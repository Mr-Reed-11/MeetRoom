import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly repo: Repository<Room>,
  ) {}

  findAll(): Promise<Room[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Room> {
    const room = await this.repo.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Sala não encontrada');
    return room;
  }

  create(dto: CreateRoomDto): Promise<Room> {
    return this.repo.save(this.repo.create({ ...dto, is_active: dto.is_active ?? true }));
  }

  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findById(id);
    Object.assign(room, dto);
    return this.repo.save(room);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findById(id);
    await this.repo.remove(room);
  }
}
