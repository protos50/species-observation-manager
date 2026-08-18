import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnvironmentService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un ambiente.
  create(createEnvironmentDto: CreateEnvironmentDto) {
    return this.prismaService.environment.create({
      data: createEnvironmentDto,
    });
  }

  // Lista los ambientes activos.
  findAll() {
    return this.prismaService.environment.findMany({
      include: {
        _count: {
          select: {
            Observation: true
          }
        }
      }
    });
  }

  // Busca un ambiente por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const environment = await this.prismaService.environment.findUnique({
      where: { id_environment: id },
      include: {
        Observation: {
          select: {
            id_observation: true,
            taxon: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            Observation: true
          }
        }
      },
    });
    
    if (!environment) {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }
    
    return environment;
  }

  // Actualiza los datos de un ambiente.
  async update(id: number, updateEnvironmentDto: UpdateEnvironmentDto) {
    try {
      return await this.prismaService.environment.update({
        where: { id_environment: id },
        data: updateEnvironmentDto,
      });
    } catch (error) {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }
  }

  // Da de baja un ambiente. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.environment.delete({
        where: { id_environment: id },
      });
    } catch (error) {
      throw new NotFoundException(`Environment with ID ${id} not found or has associated localities`);
    }
  }

  // Avisa si el ambiente está enganchado a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    const observations = await this.prismaService.observation.findMany({
      where: {
        deleted_at: null,
        id_environment: id,
      },
      select: {
        id_observation: true,
        taxon: {
          select: { name: true },
        },
      },
      orderBy: {
        id_observation: 'asc',
      },
    });

    return {
      inUse: observations.length > 0,
      count: observations.length,
      observations: observations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
      })),
    };
  }

  // Lista los ambientes que fueron dados de baja.
  async findDeleted() {
    return await (this.prismaService.environment as any).findMany({
      withDeleted: true,
      where: {
        deleted_at: {
          not: null,
        },
      },
      orderBy: {
        deleted_at: 'desc',
      },
    });
  }

  // Vuelve a activar un ambiente que estaba dado de baja.
  async restore(id: number) {
    try {
      return await (this.prismaService.environment as any).update({
        withDeleted: true,
        where: {
          id_environment: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }
  }
}
