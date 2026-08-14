import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxonomicLevelDto } from './dto/create-taxonomic-level.dto';
import { UpdateTaxonomicLevelDto } from './dto/update-taxonomic-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaxonomicLevelService {
  constructor(private prismaService: PrismaService) {}

  create(createTaxonomicLevelDto: CreateTaxonomicLevelDto) {
    return this.prismaService.taxonomicLevel.create({
      data: createTaxonomicLevelDto,
    });
  }

  findAll() {
    return this.prismaService.taxonomicLevel.findMany({
      orderBy: { id_taxonomic_level: 'asc' },
    });
  }
  findDeleted() {
    return (this.prismaService.taxonomicLevel.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  }

  async findOne(id: number) {
    const taxonomicLevel = await this.prismaService.taxonomicLevel.findUnique({
      where: { id_taxonomic_level: id },
    });

    if (!taxonomicLevel) {
      throw new NotFoundException(
        `Nivel taxonómico con ID ${id} no encontrado`,
      );
    }

    return taxonomicLevel;
  }

  async update(id: number, updateTaxonomicLevelDto: UpdateTaxonomicLevelDto) {
    try {
      return await this.prismaService.taxonomicLevel.update({
        where: { id_taxonomic_level: id },
        data: updateTaxonomicLevelDto,
      });
    } catch (error) {
      throw new NotFoundException(
        `Nivel taxonómico con ID ${id} no encontrado`,
      );
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.taxonomicLevel.delete({
        where: { id_taxonomic_level: id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Nivel taxonómico con ID ${id} no encontrado o tiene taxa asociados`,
      );
    }
  }
  async restore(id: number) {
    try {
      return await (this.prismaService.taxonomicLevel.update as any)({
        where: { id_taxonomic_level: id },
        data: { deleted_at: null },
        withDeleted: true,
      });
    } catch (error) {
      throw new NotFoundException(
        `Nivel taxonómico con ID ${id} no encontrado`,
      );
    }
  }

  async checkIfInUse(id: number) {
    const observations = await this.prismaService.observation.findMany({
      where: {
        deleted_at: null,
        taxon: {
          id_taxonomic_level: id,
        },
      },
      select: {
        id_observation: true,
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
