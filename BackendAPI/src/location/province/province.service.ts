import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProvinceService {
  constructor(private prismaService: PrismaService) {}

  create(createProvinceDto: CreateProvinceDto) {
    return this.prismaService.province.create({
      data: createProvinceDto,
    });
  }

  findAll() {
    return this.prismaService.province.findMany({
      include: {
        country: true,
      },
    });
  }

  async findByCountry(countryId: number) {
    return this.prismaService.province.findMany({
      where: {
        id_country: countryId,
      },
      include: {
        country: true,
      },
    });
  }

  async findOne(id: number) {
    const province = await this.prismaService.province.findUnique({
      where: { id_province: id },
      include: {
        country: true,
        Department: true,
      },
    });
    
    if (!province) {
      throw new NotFoundException(`Provincia con ID ${id} no encontrada`);
    }
    
    return province;
  }

  async update(id: number, updateProvinceDto: UpdateProvinceDto) {
    try {
      return await this.prismaService.province.update({
        where: { id_province: id },
        data: updateProvinceDto,
      });
    } catch (error) {
      throw new NotFoundException(`Provincia con ID ${id} no encontrada`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.province.delete({
        where: { id_province: id },
      });
    } catch (error) {
      throw new NotFoundException(`Provincia con ID ${id} no encontrada o tiene departamentos asociados`);
    }
  }

  async checkIfInUse(id: number) {
    // Get departments for this province
    const departments = await this.prismaService.department.findMany({
      where: {
        id_province: id,
        deleted_at: null,
      },
      include: {
        Locality: {
          where: { deleted_at: null },
          include: {
            Geolocation: {
              where: { deleted_at: null },
              select: { id_geolocation: true },
            },
          },
        },
      },
      orderBy: {
        department_name: 'asc',
      },
    });

    // Count total observations through the hierarchy
    const observations = await this.prismaService.observation.findMany({
      where: {
        deleted_at: null,
        geolocation: {
          locality: {
            department: {
              id_province: id,
            },
          },
        },
      },
      select: {
        id_observation: true,
        taxon: { select: { name: true } },
      },
    });

    return {
      inUse: departments.length > 0 || observations.length > 0,
      count: observations.length,
      departments: departments.map((d) => ({
        id_department: d.id_department,
        department_name: d.department_name,
        localities: d.Locality.map((l) => ({
          id_locality: l.id_locality,
          locality_name: l.locality_name,
          geolocation_count: l.Geolocation.length,
        })),
      })),
      observations: observations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
      })),
    };
  }

  async findDeleted() {
    return await (this.prismaService.province as any).findMany({
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
        country: {
          select: {
            id_country: true,
            country_name: true,
          },
        },
        Department: {
          select: {
            id_department: true,
            department_name: true,
          },
        },
      },
    });
  }

  async restore(id: number) {
    try {
      return await (this.prismaService.province as any).update({
        withDeleted: true,
        where: {
          id_province: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch (error) {
      throw new NotFoundException(`Provincia con ID ${id} no encontrada`);
    }
  }
}
