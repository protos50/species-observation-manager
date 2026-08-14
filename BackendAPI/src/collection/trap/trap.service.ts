import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrapDto } from './dto/create-trap.dto';
import { UpdateTrapDto } from './dto/update-trap.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TrapService {
  constructor(private prismaService: PrismaService) {}

  create(createTrapDto: CreateTrapDto) {
    return this.prismaService.trap.create({
      data: createTrapDto,
    });
  }

  findAll() {
    return this.prismaService.trap.findMany();
  }

  findDeleted() {
    return (this.prismaService.trap.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
      withDeleted: true,
    });
  }

  async findOne(id: number) {
    const trap = await this.prismaService.trap.findUnique({
      where: { id_trap: id },
      include: {
        Collection: true,
      },
    });

    if (!trap) {
      throw new NotFoundException(`Trampa con ID ${id} no encontrada`);
    }

    return trap;
  }

  async update(id: number, updateTrapDto: UpdateTrapDto) {
    try {
      return await this.prismaService.trap.update({
        where: { id_trap: id },
        data: updateTrapDto,
      });
    } catch (error) {
      throw new NotFoundException(`Trampa con ID ${id} no encontrada`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.trap.delete({
        where: { id_trap: id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Trampa con ID ${id} no encontrada o tiene colecciones asociadas`,
      );
    }
  }

  async restore(id: number) {
    try {
      return await (this.prismaService.trap.update as any)({
        where: { id_trap: id },
        data: { deleted_at: null },
        withDeleted: true,
      });
    } catch (error) {
      throw new NotFoundException(`Trampa con ID ${id} no encontrada`);
    }
  }

  async checkIfInUse(id: number) {
    // Find collections using this trap
    const collections = await this.prismaService.collection.findMany({
      where: {
        id_trap: id,
        deleted_at: null,
      },
      include: {
        Observation: {
          where: {
            deleted_at: null,
          },
          include: {
            taxon: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const observations = collections.flatMap((c) => c.Observation);

    return {
      inUse: observations.length > 0,
      count: observations.length,
      observations: observations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
        collection_date: collections.find(
          (c) => c.id_collection === obs.id_collection,
        )?.collection_date,
      })),
    };
  }
}
