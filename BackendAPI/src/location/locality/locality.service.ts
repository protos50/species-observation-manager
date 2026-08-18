import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocalityService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta una localidad.
  create(createLocalityDto: CreateLocalityDto) {
    return this.prismaService.locality.create({
      data: createLocalityDto,
    });
  }

  // Lista las localidades activas.
  async findAll() {
    const localities = await this.prismaService.locality.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        department: {
          include: {
            province: {
              include: {
                country: true,
              }
            }
          }
        },
        _count: {
          select: {
            Geolocation: true,
            ClimateData: true,
          }
        }
      }
    });

    // Agregar contador de observaciones para cada localidad
    const localitiesWithObservationCount = await Promise.all(
      localities.map(async (locality) => {
        const observationCount = await this.prismaService.observation.count({
          where: {
            deleted_at: null,
            geolocation: {
              id_locality: locality.id_locality,
              deleted_at: null,
            }
          }
        });

        return {
          ...locality,
          _count: {
            ...locality._count,
            Observations: observationCount,
          }
        };
      })
    );

    return localitiesWithObservationCount;
  }

  // Lista las localidades de un departamento.
  async findByDepartment(departmentId: number) {
    const localities = await this.prismaService.locality.findMany({
      where: {
        id_department: departmentId,
        deleted_at: null,
      },
      include: {
        department: {
          include: {
            province: {
              include: {
                country: true
              }
            }
          }
        },
        _count: {
          select: {
            Geolocation: true,
            ClimateData: true,
          }
        }
      }
    });

    // Agregar contador de observaciones para cada localidad
    const localitiesWithObservationCount = await Promise.all(
      localities.map(async (locality) => {
        const observationCount = await this.prismaService.observation.count({
          where: {
            deleted_at: null,
            geolocation: {
              id_locality: locality.id_locality,
              deleted_at: null,
            }
          }
        });

        return {
          ...locality,
          _count: {
            ...locality._count,
            Observations: observationCount,
          }
        };
      })
    );

    return localitiesWithObservationCount;
  }

  // Busca una localidad por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const locality = await this.prismaService.locality.findUnique({
      where: { id_locality: id },
      include: {
        department: {
          include: {
            province: {
              include: {
                country: true
              }
            }
          }
        },
        Geolocation: {
          select: {
            id_geolocation: true,
            latitude: true,
            longitude: true,
            altitude: true
          }
        },
        _count: {
          select: {
            Geolocation: true
          }
        }
      },
    });
    
    if (!locality) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada`);
    }
    
    return locality;
  }

  // Actualiza los datos de una localidad.
  async update(id: number, updateLocalityDto: UpdateLocalityDto) {
    try {
      return await this.prismaService.locality.update({
        where: { id_locality: id },
        data: updateLocalityDto,
      });
    } catch (error) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada`);
    }
  }

  // Da de baja una localidad. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.locality.delete({
        where: { id_locality: id },
      });
    } catch (error) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada o tiene observaciones asociadas`);
    }
  }

  // Avisa si la localidad está enganchada a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    const [geolocations, climateData, observations] = await Promise.all([
      this.prismaService.geolocation.findMany({
        where: {
          id_locality: id,
          deleted_at: null,
        },
        select: {
          id_geolocation: true,
          latitude: true,
          longitude: true,
        },
        orderBy: {
          id_geolocation: 'asc',
        },
      }),
      this.prismaService.climateData.findMany({
        where: {
          id_locality: id,
          deleted_at: null,
        },
        select: {
          id_climate_data: true,
          climate_date: true,
        },
        orderBy: {
          climate_date: 'desc',
        },
      }),
      this.prismaService.observation.findMany({
        where: {
          OR: [
            { geolocation: { id_locality: id, deleted_at: null } },
            { climate_data: { id_locality: id, deleted_at: null } },
          ],
          deleted_at: null,
        },
        select: {
          id_observation: true,
          taxon: {
            select: { name: true },
          },
        },
        orderBy: {
          id_observation: 'asc',
        },
      }),
    ]);

    return {
      inUse: geolocations.length + climateData.length + observations.length > 0,
      count: observations.length,
      geolocations,
      climateData,
      observations: observations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
      })),
    };
  }

  // Lista las localidades que fueron dadas de baja.
  async findDeleted() {
    return await (this.prismaService.locality as any).findMany({
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
        Geolocation: {
          select: {
            id_geolocation: true,
          },
        },
        ClimateData: {
          select: {
            id_climate_data: true,
            climate_date: true,
          },
        },
      },
    });
  }

  // Vuelve a activar una localidad que estaba dada de baja.
  async restore(id: number) {
    try {
      return await (this.prismaService.locality as any).update({
        withDeleted: true,
        where: {
          id_locality: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch (error) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada`);
    }
  }
}
