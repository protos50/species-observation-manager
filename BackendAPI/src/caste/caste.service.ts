import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCasteDto } from './dto/create-caste.dto';
import { UpdateCasteDto } from './dto/update-caste.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CasteService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta una casta.
  create(createCasteDto: CreateCasteDto) {
    return this.prismaService.caste.create({
      data: createCasteDto,
    });
  }

  // Lista las castas activas.
  findAll() {
    return this.prismaService.caste.findMany({
      include: {
        _count: {
          select: {
            Observation: true,
          },
        },
      },
    });
  }

  // Lista las castas que fueron dadas de baja.
  findDeleted() {
    return (this.prismaService.caste.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
      withDeleted: true,
    });
  }

  // Busca una casta por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const caste = await this.prismaService.caste.findUnique({
      where: { id_caste: id },
      include: {
        Observation: {
          select: {
            id_observation: true,
            taxon: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!caste) {
      throw new NotFoundException(`Caste with ID ${id} not found`);
    }

    return caste;
  }

  // Actualiza los datos de una casta.
  async update(id: number, updateCasteDto: UpdateCasteDto) {
    try {
      return await this.prismaService.caste.update({
        where: { id_caste: id },
        data: updateCasteDto,
      });
    } catch (error) {
      throw new NotFoundException(`Caste with ID ${id} not found`);
    }
  }

  // Da de baja una casta. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.caste.delete({
        where: { id_caste: id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Caste with ID ${id} not found or has associated observations`,
      );
    }
  }

  // Vuelve a activar una casta que estaba dada de baja.
  async restore(id: number) {
    try {
      return await (this.prismaService.caste.update as any)({
        where: { id_caste: id },
        data: { deleted_at: null },
        withDeleted: true,
      });
    } catch (error) {
      throw new NotFoundException(`Caste with ID ${id} not found`);
    }
  }

  // Avisa si la casta está enganchada a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    const observations = await this.prismaService.observation.findMany({
      where: {
        id_caste: id,
        deleted_at: null,
      },
      include: {
        taxon: {
          select: {
            name: true,
          },
        },
        collection: {
          select: {
            collection_date: true,
          },
        },
      },
    });

    return {
      inUse: observations.length > 0,
      count: observations.length,
      observations: observations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
        collection_date: obs.collection?.collection_date,
      })),
    };
  }
}
