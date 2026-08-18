import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaxonDto } from './dto/create-taxon.dto';
import { UpdateTaxonDto } from './dto/update-taxon.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaxonService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un taxón.
  create(createTaxonDto: CreateTaxonDto) {
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
    try {
      return await this.prismaService.taxon.update({
        where: { id_taxon: id },
        data: updateTaxonDto,
      });
    } catch (error) {
      throw new NotFoundException(`Taxón con ID ${id} no encontrado`);
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
