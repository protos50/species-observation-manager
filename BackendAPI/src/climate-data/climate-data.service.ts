import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClimateDatumDto } from './dto/create-climate-datum.dto';
import { UpdateClimateDatumDto } from './dto/update-climate-datum.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClimateDataService {
  constructor(private prismaService: PrismaService) {}

  async create(createClimateDatumDto: CreateClimateDatumDto) {
    try {
      return await this.prismaService.climateData.create({
        data: createClimateDatumDto,
      });
    } catch (error) {
      // Si el error es de constraint unique, significa que ya existe
      if (error.code === 'P2002') {
        // Usar upsert para actualizar el registro existente
        return await this.prismaService.climateData.upsert({
          where: {
            id_locality_climate_date: {
              id_locality: createClimateDatumDto.id_locality,
              climate_date: createClimateDatumDto.climate_date,
            },
          },
          update: createClimateDatumDto,
          create: createClimateDatumDto,
        });
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.climateData.findMany({
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
        climate_date: 'desc',
      },
    });
  }

  async findByLocalityAndDate(localityId: number, date: string) {
    // Buscar datos climáticos para una localidad y fecha específica
    // Normalizar fecha a medianoche UTC para comparar correctamente con @db.Date
    // Parsear la fecha directamente como YYYY-MM-DD para evitar problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    const climateDate = new Date(Date.UTC(year, month - 1, day));
    
    console.log('🔍 Buscando datos climáticos:', {
      localityId,
      dateInput: date,
      dateUTC: climateDate.toISOString(),
    });
    
    const result = await this.prismaService.climateData.findUnique({
      where: {
        id_locality_climate_date: {
          id_locality: localityId,
          climate_date: climateDate,
        },
      },
      include: {
        locality: true,
      },
    });
    
    console.log('✅ Resultado:', result ? 'Encontrado' : 'No encontrado');
    
    return result;
  }

  async findByLocality(localityId: number) {
    // Obtener todos los datos climáticos de una localidad
    return this.prismaService.climateData.findMany({
      where: { id_locality: localityId },
      include: {
        locality: true,
      },
      orderBy: {
        climate_date: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const climateData = await this.prismaService.climateData.findUnique({
      where: { id_climate_data: id },
    });

    if (!climateData) {
      throw new NotFoundException(`Climate data with ID ${id} not found`);
    }

    return climateData;
  }

  async update(id: number, updateClimateDatumDto: UpdateClimateDatumDto) {
    try {
      return await this.prismaService.climateData.update({
        where: { id_climate_data: id },
        data: updateClimateDatumDto,
      });
    } catch (error) {
      throw new NotFoundException(`Climate data with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.climateData.delete({
        where: { id_climate_data: id },
      });
    } catch (error) {
      throw new NotFoundException(`Climate data with ID ${id} not found`);
    }
  }

  // Validar si el ClimateData está siendo usado por alguna Observation
  async checkIfInUse(id: number) {
    const observations = await this.prismaService.observation.findMany({
      where: {
        id_climate_data: id,
        deleted_at: null, // Solo observaciones no eliminadas
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

  // Obtener registros eliminados (soft deleted)
  async findDeleted() {
    return await (this.prismaService.climateData as any).findMany({
      withDeleted: true,
      where: {
        deleted_at: {
          not: null,
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
        deleted_at: 'desc',
      },
    });
  }

  // Restaurar un registro eliminado
  async restore(id: number) {
    try {
      return await (this.prismaService.climateData as any).update({
        withDeleted: true,
        where: {
          id_climate_data: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch (error) {
      throw new NotFoundException(`Climate data with ID ${id} not found`);
    }
  }
}
