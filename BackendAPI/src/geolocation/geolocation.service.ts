import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Geolocation } from '@prisma/client';

@Injectable()
export class GeolocationService {
  constructor(private prisma: PrismaService) {}

  // Da de alta una geolocalización.
  async create(data: {
    latitude: number;
    longitude: number;
    altitude?: number;
    source_type: string;
    id_locality: number;
    ihh?: number;
    distance_to_river?: number;
    tag?: string;
  }): Promise<Geolocation> {
    // Verificar si ya existe una geolocalización con exactamente los mismos valores
    const existing = await this.prisma.geolocation.findFirst({
      where: {
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        id_locality: data.id_locality,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una geolocalización con estos valores exactos. ' +
        'Si desea crear un nuevo punto, modifique al menos uno de los valores.'
      );
    }

    return this.prisma.geolocation.create({
      data,
    });
  }

  // Lista las geolocalizaciones activas.
  async findAll(): Promise<Geolocation[]> {
    return this.prisma.geolocation.findMany({
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
      orderBy: {
        id_geolocation: 'desc',
      },
    });
  }

  // Busca una geolocalización por id; si no lo encuentra, responde 404.
  async findOne(id: number): Promise<Geolocation | null> {
    return this.prisma.geolocation.findUnique({
      where: { id_geolocation: id },
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
    });
  }

  // Busca geolocalizaciones que caigan en unas coordenadas exactas.
  async findByCoordinates(latitude: number, longitude: number): Promise<Geolocation[]> {
    return this.prisma.geolocation.findMany({
      where: {
        latitude,
        longitude,
      },
    });
  }

  // Busca geolocalizaciones por su etiqueta, el nombre corto con el que las identifica el equipo.
  async findByTag(tag: string): Promise<Geolocation[]> {
    return this.prisma.geolocation.findMany({
      where: {
        tag: {
          equals: tag,
          mode: 'insensitive',
        },
      },
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
      orderBy: {
        id_geolocation: 'desc',
      },
    });
  }

  // Actualiza los datos de una geolocalización.
  async update(id: number, data: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    source_type?: string;
    id_locality?: number;
    ihh?: number;
    distance_to_river?: number;
    tag?: string;
  }): Promise<Geolocation> {
    return this.prisma.geolocation.update({
      where: { id_geolocation: id },
      data,
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
    });
  }

  // Da de baja una geolocalización. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number): Promise<Geolocation> {
    return this.prisma.geolocation.update({
      where: { id_geolocation: id },
      data: { deleted_at: new Date() },
    });
  }

  // Avisa si la geolocalización está enganchada a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    const observations = await this.prisma.observation.findMany({
      where: {
        id_geolocation: id,
        deleted_at: null,
      },
      select: {
        id_observation: true,
        taxon: {
          select: { name: true },
        },
        collection: {
          select: { collection_date: true },
        },
      },
      orderBy: {
        id_observation: 'asc',
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

  // Lista las geolocalizaciones que fueron dadas de baja.
  async findDeleted() {
    return await (this.prisma.geolocation as any).findMany({
      withDeleted: true,
      where: {
        deleted_at: {
          not: null,
        },
      },
      orderBy: {
        deleted_at: 'desc',
      },
      include: {
        locality: {
          select: {
            id_locality: true,
            locality_name: true,
            department: {
              select: {
                id_department: true,
                department_name: true,
                province: {
                  select: {
                    id_province: true,
                    province_name: true,
                    country: {
                      select: {
                        id_country: true,
                        country_name: true,
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
  }

  // Vuelve a activar una geolocalización que estaba dada de baja.
  async restore(id: number) {
    try {
      return await (this.prisma.geolocation as any).update({
        withDeleted: true,
        where: {
          id_geolocation: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch (error) {
      throw new Error(`Geolocalización con ID ${id} no encontrada`);
    }
  }
}
