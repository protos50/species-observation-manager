import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaxonDto } from './dto/create-taxon.dto';
import { UpdateTaxonDto } from './dto/update-taxon.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaxonService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un taxón.
  async create(createTaxonDto: CreateTaxonDto) {
    await this.checkHierarchy(
      createTaxonDto.id_taxonomic_level,
      createTaxonDto.parent_id,
    );
    return this.prismaService.taxon.create({
      data: createTaxonDto,
    });
  }

  // Lista los taxones activos.
  findAll() {
    return this.prismaService.taxon.findMany({
      include: {
        taxonomic_level: true,
        author: true,
        parent: {
          include: {
            taxonomic_level: true,
          },
        },
      },
    });
  }

  // Busca un taxón por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const taxon = await this.prismaService.taxon.findUnique({
      where: { id_taxon: id },
      include: {
        taxonomic_level: true,
        author: true,
        parent: {
          include: {
            taxonomic_level: true,
          },
        },
        children: {
          include: {
            taxonomic_level: true,
          }
        }
      },
    });
    
    if (!taxon) {
      throw new NotFoundException(`Taxón con ID ${id} no encontrado`);
    }
    
    return taxon;
  }

  // Actualiza los datos de un taxón.
  async update(id: number, updateTaxonDto: UpdateTaxonDto) {
    const current = await this.prismaService.taxon.findUnique({
      where: { id_taxon: id },
    });
    if (!current) {
      throw new NotFoundException(`Taxón con ID ${id} no encontrado`);
    }

    // Solo se valida la jerarquía si cambia el nivel o el padre
    const levelId =
      updateTaxonDto.id_taxonomic_level ?? current.id_taxonomic_level;
    const parentId =
      updateTaxonDto.parent_id === undefined
        ? current.parent_id
        : updateTaxonDto.parent_id;
    if (
      levelId !== current.id_taxonomic_level ||
      parentId !== current.parent_id
    ) {
      await this.checkHierarchy(levelId, parentId, id);
    }

    try {
      return await this.prismaService.taxon.update({
        where: { id_taxon: id },
        data: updateTaxonDto,
      });
    } catch (error) {
      throw new NotFoundException(`Taxón con ID ${id} no encontrado`);
    }
  }

  // El padre tiene que estar en un nivel más alto que el del taxón y los hijos en
  // uno más bajo. Así el árbol respeta el orden de los niveles y no puede formar ciclos.
  private async checkHierarchy(
    levelId: number,
    parentId?: number | null,
    taxonId?: number,
  ) {
    const level = await this.prismaService.taxonomicLevel.findUnique({
      where: { id_taxonomic_level: levelId },
    });
    if (!level) {
      throw new BadRequestException(
        `Nivel taxonómico con ID ${levelId} no encontrado`,
      );
    }

    if (parentId) {
      const parent = await this.prismaService.taxon.findUnique({
        where: { id_taxon: parentId },
        include: { taxonomic_level: true },
      });
      if (!parent) {
        throw new BadRequestException(
          `Taxón padre con ID ${parentId} no encontrado`,
        );
      }
      if (parent.taxonomic_level.level_order >= level.level_order) {
        throw new BadRequestException(
          `${parent.name} (${parent.taxonomic_level.name}) no puede ser padre de un taxón de nivel ${level.name}: tiene que estar en un nivel más alto`,
        );
      }
    }

    if (taxonId !== undefined) {
      const child = await this.prismaService.taxon.findFirst({
        where: {
          parent_id: taxonId,
          taxonomic_level: { level_order: { lte: level.level_order } },
        },
        select: { name: true },
      });
      if (child) {
        throw new BadRequestException(
          `El taxón no puede pasar al nivel ${level.name}: su hijo ${child.name} quedaría en un nivel igual o más alto`,
        );
      }
    }
  }

  // Da de baja un taxón. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.taxon.delete({
        where: { id_taxon: id },
      });
    } catch (error) {
      throw new NotFoundException(`Taxón con ID ${id} no encontrado o tiene registros asociados`);
    }
  }

  // Funciones específicas que utilizan las funciones almacenadas de PostgreSQL
  async getTaxonomicHierarchy(id: number) {
    // Llamada a la función almacenada get_taxonomic_hierarchy
    const result = await this.prismaService.$queryRaw`
      SELECT * FROM get_taxonomic_hierarchy(${id}::integer)
    `;
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new NotFoundException(`No se encontró jerarquía para el taxón con ID ${id}`);
    }
    
    return result;
  }

  // Baja por el árbol y trae todo lo que cuelga de un taxón.
  async getTaxonomicDescendants(id: number) {
    // Llamada a la función almacenada get_taxonomic_descendants
    const result = await this.prismaService.$queryRaw`
      SELECT * FROM get_taxonomic_descendants(${id}::integer)
    `;
    
    return result;
  }

  // Busca taxones por nombre.
  async searchTaxa(searchTerm: string) {
    // Llamada a la función almacenada search_taxa
    const result = await this.prismaService.$queryRaw`
      SELECT * FROM search_taxa(${searchTerm})
    `;
    
    return result;
  }

  // Método adicional para obtener taxones por nivel taxonómico
  async findByTaxonomicLevel(levelId: number) {
    return this.prismaService.taxon.findMany({
      where: {
        id_taxonomic_level: levelId,
      },
      include: {
        taxonomic_level: true,
        parent: {
          include: {
            taxonomic_level: true,
          },
        },
      },
    });
  }

  // Método para obtener taxones hijos directos de un taxón padre
  async findChildren(parentId: number) {
    return this.prismaService.taxon.findMany({
      where: {
        parent_id: parentId,
      },
      include: {
        taxonomic_level: true,
      },
    });
  }

  // Avisa si el taxón está enganchado a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    const observations = await this.prismaService.observation.findMany({
      where: {
        id_taxon: id,
        deleted_at: null,
      },
      include: {
        geolocation: {
          select: {
            locality: {
              select: {
                locality_name: true,
              },
            },
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
        locality_name: obs.geolocation?.locality?.locality_name,
        collection_date: obs.collection?.collection_date,
      })),
    };
  }

  // Lista los taxones que fueron dados de baja.
  async findDeleted() {
    return await (this.prismaService.taxon as any).findMany({
      withDeleted: true,
      where: {
        deleted_at: {
          not: null,
        },
      },
      include: {
        taxonomic_level: true,
        author: true,
        parent: {
          include: {
            taxonomic_level: true,
          },
        },
      },
      orderBy: {
        deleted_at: 'desc',
      },
    });
  }

  // Vuelve a activar un taxón que estaba dado de baja.
  async restore(id: number) {
    try {
      return await (this.prismaService.taxon as any).update({
        withDeleted: true,
        where: {
          id_taxon: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch (error) {
      throw new NotFoundException(`Taxón con ID ${id} no encontrado`);
    }
  }
}
