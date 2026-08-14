import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    return await this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll() {
    // Middleware automatically filters deleted_at = null
    return await this.prisma.service.findMany({
      orderBy: {
        service_name: 'asc',
      },
    });
  }
  findDeleted() {
    return (this.prisma.service.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  }

  async findOne(id: number) {
    // Middleware automatically filters deleted_at = null
    const service = await this.prisma.service.findUnique({
      where: { id_service: id },
      include: {
        Contact: {
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // Validate existence

    return await this.prisma.service.update({
      where: { id_service: id },
      data: updateServiceDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Validate existence

    // Soft delete: middleware converts delete to update with deleted_at
    return await this.prisma.service.delete({
      where: { id_service: id },
    });
  }
  async restore(id: number) {
    try {
      return await (this.prisma.service.update as any)({
        where: { id_service: id },
        data: { deleted_at: null },
        withDeleted: true,
      });
    } catch (error) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async checkIfInUse(id: number) {
    // Services are referenced through Collection -> Observation
    // For now, return empty observations (services are rarely deleted)
    return {
      inUse: false,
      count: 0,
      observations: [],
    };
  }
}
