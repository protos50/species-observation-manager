import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaxonomicLevelDto } from './dto/create-taxonomic-level.dto';
import { UpdateTaxonomicLevelDto } from './dto/update-taxonomic-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaxonomicLevelService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un nivel taxonómico. Va justo debajo del nivel indicado en
  // above_level_id (o primero, si viene null); si no se indica, queda último.
  async create(createTaxonomicLevelDto: CreateTaxonomicLevelDto) {
    const { above_level_id, ...data } = createTaxonomicLevelDto;
    const level_order =
      above_level_id === undefined
        ? (await this.lastLevelOrder()) + 1
        : await this.makeRoomBelow(await this.orderOf(above_level_id));

    return this.prismaService.taxonomicLevel.create({
      data: { ...data, level_order },
    });
  }

  // Lista los niveles taxonómicos activos, de arriba hacia abajo en la jerarquía.
  findAll() {
    return this.prismaService.taxonomicLevel.findMany({
      orderBy: [{ level_order: 'asc' }, { id_taxonomic_level: 'asc' }],
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

  // Actualiza los datos de un nivel taxonómico. Si viene above_level_id, además
  // lo mueve para que quede justo debajo de ese nivel (o primero, si viene null).
  async update(id: number, updateTaxonomicLevelDto: UpdateTaxonomicLevelDto) {
    const { above_level_id, ...data } = updateTaxonomicLevelDto;
    let level_order: number | undefined;

    if (above_level_id !== undefined) {
      if (above_level_id === id) {
        throw new BadRequestException('Un nivel no puede ir debajo de sí mismo');
      }
      const aboveOrder = await this.orderOf(above_level_id);
      await this.checkCanMove(id, aboveOrder);
      level_order = await this.makeRoomBelow(aboveOrder);
    }

    try {
      return await this.prismaService.taxonomicLevel.update({
        where: { id_taxonomic_level: id },
        data: { ...data, level_order },
      });
    } catch (error) {
      throw new NotFoundException(
        `Nivel taxonómico con ID ${id} no encontrado`,
      );
    }
  }

  // Posición del nivel que va a quedar arriba; 0 cuando el nivel va primero.
  private async orderOf(levelId: number | null) {
    if (levelId === null) return 0;

    const level = await this.prismaService.taxonomicLevel.findUnique({
      where: { id_taxonomic_level: levelId },
    });
    if (!level) {
      throw new BadRequestException(
        `Nivel taxonómico con ID ${levelId} no encontrado`,
      );
    }
    return level.level_order;
  }

  // Posición del último nivel, contando también los dados de baja.
  private async lastLevelOrder(): Promise<number> {
    const result = await (this.prismaService.taxonomicLevel.aggregate as any)({
      _max: { level_order: true },
      withDeleted: true,
    });
    return result._max.level_order ?? 0;
  }

  // Corre un lugar hacia abajo a todos los niveles que están debajo de esa
  // posición, dados de baja incluidos, y devuelve el lugar que queda libre.
  private async makeRoomBelow(aboveOrder: number) {
    await (this.prismaService.taxonomicLevel.updateMany as any)({
      where: { level_order: { gt: aboveOrder } },
      data: { level_order: { increment: 1 } },
      withDeleted: true,
    });
    return aboveOrder + 1;
  }

  // La jerarquía de taxones se apoya en este orden: al mover un nivel, ninguno de
  // sus taxones puede quedar arriba de su padre ni debajo de uno de sus hijos.
  private async checkCanMove(id: number, aboveOrder: number) {
    const conflict = await this.prismaService.taxon.findFirst({
      where: {
        id_taxonomic_level: id,
        OR: [
          {
            parent: {
              taxonomic_level: {
                id_taxonomic_level: { not: id },
                level_order: { gt: aboveOrder },
              },
            },
          },
          {
            children: {
              some: {
                taxonomic_level: {
                  id_taxonomic_level: { not: id },
                  level_order: { lte: aboveOrder },
                },
              },
            },
          },
        ],
      },
      select: { name: true },
    });

    if (conflict) {
      throw new BadRequestException(
        `No se puede mover el nivel: el taxón ${conflict.name} quedaría arriba de su padre o debajo de uno de sus hijos`,
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
