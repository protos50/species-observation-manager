import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnvironmentService {
  constructor(private prismaService: PrismaService) {}

  create(createEnvironmentDto: CreateEnvironmentDto) {
    return this.prismaService.environment.create({
      data: createEnvironmentDto,
    });
  }

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

  async remove(id: number) {
    try {
      return await this.prismaService.environment.delete({
        where: { id_environment: id },
      });
    } catch (error) {
      throw new NotFoundException(`Environment with ID ${id} not found or has associated localities`);
    }
  }

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
