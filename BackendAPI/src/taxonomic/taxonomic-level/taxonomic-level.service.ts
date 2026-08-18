import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxonomicLevelDto } from './dto/create-taxonomic-level.dto';
import { UpdateTaxonomicLevelDto } from './dto/update-taxonomic-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaxonomicLevelService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un nivel taxonómico.
  create(createTaxonomicLevelDto: CreateTaxonomicLevelDto) {
    return this.prismaService.taxonomicLevel.create({
      data: createTaxonomicLevelDto,
    });
  }

  // Lista los niveles taxonómicos activos.
  findAll() {
    return this.prismaService.taxonomicLevel.findMany({
      orderBy: { id_taxonomic_level: 'asc' },
    });
  }
  // Lista los niveles taxonómicos que fueron dados de baja.
  findDeleted() {
    return (this.prismaService.taxonomicLevel.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  }

  // Busca un nivel taxonómico por id; si no lo encuentra, responde 404.
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

  // Actualiza los datos de un nivel taxonómico.
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

  // Da de baja un nivel taxonómico. Es baja lógica: el registro queda en la base con su fecha de borrado.
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
  // Vuelve a activar un nivel taxonómico que estaba dado de baja.
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

  // Avisa si el nivel taxonómico está enganchado a otros registros, así no se borra algo que todavía se usa.
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
