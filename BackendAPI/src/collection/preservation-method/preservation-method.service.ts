import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePreservationMethodDto } from './dto/create-preservation-method.dto';
import { UpdatePreservationMethodDto } from './dto/update-preservation-method.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PreservationMethodService {
  constructor(private prismaService: PrismaService) {}

  create(createPreservationMethodDto: CreatePreservationMethodDto) {
    return this.prismaService.preservationMethod.create({
      data: createPreservationMethodDto,
    });
  }

  findAll() {
    return this.prismaService.preservationMethod.findMany();
  }

  findDeleted() {
    return (this.prismaService.preservationMethod.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
      withDeleted: true,
    });
  }

  async findOne(id: number) {
    const method = await this.prismaService.preservationMethod.findUnique({
      where: { id_preservation_method: id },
      include: {
        Collection: true,
      },
    });

    if (!method) {
      throw new NotFoundException(
        `Método de preservación con ID ${id} no encontrado`,
      );
    }

    return method;
  }

  async update(
    id: number,
    updatePreservationMethodDto: UpdatePreservationMethodDto,
  ) {
    try {
      return await this.prismaService.preservationMethod.update({
        where: { id_preservation_method: id },
        data: updatePreservationMethodDto,
      });
    } catch (error) {
      throw new NotFoundException(
        `Método de preservación con ID ${id} no encontrado`,
      );
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.preservationMethod.delete({
        where: { id_preservation_method: id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Método de preservación con ID ${id} no encontrado o tiene colecciones asociadas`,
      );
    }
  }

  async restore(id: number) {
    try {
      return await (this.prismaService.preservationMethod.update as any)({
        where: { id_preservation_method: id },
        data: { deleted_at: null },
        withDeleted: true,
      });
    } catch (error) {
      throw new NotFoundException(
        `Método de preservación con ID ${id} no encontrado`,
      );
    }
  }

  async checkIfInUse(id: number) {
    // Find collections using this preservation method
    const collections = await this.prismaService.collection.findMany({
      where: {
        id_preservation_method: id,
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
