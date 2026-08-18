import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  // Da de alta un servicio.
  async create(createServiceDto: CreateServiceDto) {
    return await this.prisma.service.create({
      data: createServiceDto,
    });
  }

  // Lista los servicios activos.
  async findAll() {
    // Middleware automatically filters deleted_at = null
    return await this.prisma.service.findMany({
      orderBy: {
        service_name: 'asc',
      },
    });
  }
  // Lista los servicios que fueron dados de baja.
  findDeleted() {
    return (this.prisma.service.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  }

  // Busca un servicio por id; si no lo encuentra, responde 404.
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

  // Actualiza los datos de un servicio.
  async update(id: number, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // Validate existence

    return await this.prisma.service.update({
      where: { id_service: id },
      data: updateServiceDto,
    });
  }

  // Da de baja un servicio. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    await this.findOne(id); // Validate existence

    // Baja lógica: el middleware convierte el delete en un update con deleted_at
    return await this.prisma.service.delete({
      where: { id_service: id },
    });
  }
  // Vuelve a activar un servicio que estaba dado de baja.
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

  // Avisa si el servicio está enganchado a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    // Services are referenced through Collection -> Observation
    // Por ahora devuelve vacio: los servicios casi nunca se dan de baja
    return {
      inUse: false,
      count: 0,
      observations: [],
    };
  }
}
