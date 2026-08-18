import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CollectionService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta una colección.
  create(createCollectionDto: CreateCollectionDto) {
    return this.prismaService.collection.create({
      data: createCollectionDto,
      include: {
        person: true,
        preservation_method: true,
        trap: true,
      },
    });
  }

  // Lista las colecciones activas.
  findAll() {
    return this.prismaService.collection.findMany({
      include: {
        person: true,
        preservation_method: true,
        trap: true,
        Observation: {
          include: {
            taxon: {
              include: {
                taxonomic_level: true,
                parent: true,
              },
            },
            geolocation: {
              include: {
                locality: {
                  include: {
                    department: {
                      include: {
                        province: {
                          include: {
                            country: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            environment: true,
          },
        },
      },
    });
  }

  // Busca una colección por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id_collection: id },
      include: {
        person: true,
        preservation_method: true,
        trap: true,
        Observation: {
          include: {
            taxon: {
              include: {
                taxonomic_level: true,
                parent: true,
              },
            },
            geolocation: {
              include: {
                locality: {
                  include: {
                    department: {
                      include: {
                        province: {
                          include: {
                            country: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            environment: true,
          },
        },
      },
    });
    
    if (!collection) {
      throw new NotFoundException(`Colección con ID ${id} no encontrada`);
    }
    
    return collection;
  }
  
  // Lista las colecciones que juntó una persona.
  async findByPerson(personId: number) {
    return this.prismaService.collection.findMany({
      where: {
        id_person: personId,
      },
      include: {
        person: true,
        preservation_method: true,
        trap: true,
        Observation: {
          include: {
            taxon: true,
            geolocation: {
              include: {
                locality: true,
              },
            },
            environment: true,
          },
        },
      },
    });
  }

  // Lista las colecciones hechas entre dos fechas.
  async findByDateRange(startDate: Date, endDate: Date) {
    return this.prismaService.collection.findMany({
      where: {
        collection_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        person: true,
        preservation_method: true,
        trap: true,
        Observation: {
          include: {
            taxon: true,
            geolocation: {
              include: {
                locality: true,
              },
            },
            environment: true,
          },
        },
      },
    });
  }

  // Actualiza los datos de una colección.
  async update(id: number, updateCollectionDto: UpdateCollectionDto) {
    try {
      // Verificar que todos los campos requeridos existan en el DTO
      if (!updateCollectionDto.id_person || 
          !updateCollectionDto.id_preservation_method || 
          !updateCollectionDto.id_trap || 
          !updateCollectionDto.collection_date) {
        throw new Error('Todos los campos son requeridos para actualizar una colección');
      }
      
      // Construir datos de actualización incluyendo trap_number si está presente
      const updateData: any = {
        id_person: updateCollectionDto.id_person,
        id_preservation_method: updateCollectionDto.id_preservation_method,
        id_trap: updateCollectionDto.id_trap,
        collection_date: updateCollectionDto.collection_date instanceof Date 
          ? updateCollectionDto.collection_date 
          : new Date(updateCollectionDto.collection_date as string),
      };

      // Agregar trap_number si está presente en el DTO
      if (updateCollectionDto.trap_number !== undefined) {
        updateData.trap_number = updateCollectionDto.trap_number;
      }
      
      // Usar Prisma directo para actualizar la colección
      const updatedCollection = await this.prismaService.collection.update({
        where: { id_collection: id },
        data: updateData,
        include: {
          person: true,
          preservation_method: true,
          trap: true,
          Observation: {
            include: {
              taxon: {
                include: {
                  taxonomic_level: true,
                  parent: true,
                },
              },
              geolocation: {
                include: {
                  locality: {
                    include: {
                      department: {
                        include: {
                          province: {
                            include: {
                              country: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      
      return updatedCollection;
    } catch (error) {
      throw new NotFoundException(`Error al actualizar la colección con ID ${id}: ${error.message}`);
    }
  }

  // Da de baja una colección. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.collection.delete({
        where: { id_collection: id },
      });
    } catch (error) {
      throw new NotFoundException(`Colección con ID ${id} no encontrada o tiene observaciones asociadas`);
    }
  }
  
  // Método para invocar la función almacenada que añade una colección y observación
  async addCollectionWithObservation(
    personId: number, 
    preservationMethodId: number, 
    trapId: number, 
    collectionDate: Date,
    taxonId: number,
    localityId: number
  ) {
    const result = await this.prismaService.$queryRaw`
      SELECT * FROM add_collection_and_observation(
        ${personId}, 
        ${preservationMethodId}, 
        ${trapId}, 
        ${collectionDate}::DATE,
        ${taxonId},
        ${localityId}
      )
    `;
    
    return result;
  }
}
