import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrapDto } from './dto/create-trap.dto';
import { UpdateTrapDto } from './dto/update-trap.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TrapService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta una trampa.
  create(createTrapDto: CreateTrapDto) {
    return this.prismaService.trap.create({
      data: createTrapDto,
    });
  }

  // Lista las trampas activas.
  findAll() {
    return this.prismaService.trap.findMany();
  }

  // Lista las trampas que fueron dadas de baja.
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

  // Busca una trampa por id; si no lo encuentra, responde 404.
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

  // Actualiza los datos de una trampa.
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

  // Da de baja una trampa. Es baja lógica: el registro queda en la base con su fecha de borrado.
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

  // Vuelve a activar una trampa que estaba dada de baja.
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

  // Avisa si la trampa está enganchada a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    // Busca colecciones que estén usando esta trampa
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
