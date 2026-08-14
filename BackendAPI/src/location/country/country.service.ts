import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CountryService {
  constructor(private prismaService: PrismaService) {}

  create(createCountryDto: CreateCountryDto) {
    return this.prismaService.country.create({
      data: createCountryDto,
    });
  }

  findAll() {
    return this.prismaService.country.findMany();
  }

  async findOne(id: number) {
    const country = await this.prismaService.country.findUnique({
      where: { id_country: id },
      include: {
        Province: true,
      },
    });
    
    if (!country) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }
    
    return country;
  }

  async update(id: number, updateCountryDto: UpdateCountryDto) {
    try {
      return await this.prismaService.country.update({
        where: { id_country: id },
        data: updateCountryDto,
      });
    } catch (error) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.country.delete({
        where: { id_country: id },
      });
    } catch (error) {
      throw new NotFoundException(`País con ID ${id} no encontrado o tiene provincias asociadas`);
    }
  }

  async checkIfInUse(id: number) {
    // Get provinces for this country
    const provinces = await this.prismaService.province.findMany({
      where: {
        id_country: id,
        deleted_at: null,
      },
      include: {
        Department: {
          where: { deleted_at: null },
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
        },
      },
      orderBy: {
        province_name: 'asc',
      },
    });

    // Count total observations through the hierarchy
    const observations = await this.prismaService.observation.findMany({
      where: {
        deleted_at: null,
        geolocation: {
          locality: {
            department: {
              province: {
                id_country: id,
              },
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
      inUse: provinces.length > 0 || observations.length > 0,
      count: observations.length,
      provinces: provinces.map((p) => ({
        id_province: p.id_province,
        province_name: p.province_name,
        departments: p.Department.map((d) => ({
          id_department: d.id_department,
          department_name: d.department_name,
          localities: d.Locality.map((l) => ({
            id_locality: l.id_locality,
            locality_name: l.locality_name,
            geolocation_count: l.Geolocation.length,
          })),
        })),
      })),
      observations: observations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
      })),
    };
  }

  async findDeleted() {
    return await (this.prismaService.country as any).findMany({
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
        Province: {
          select: {
            id_province: true,
            province_name: true,
          },
        },
      },
    });
  }

  async restore(id: number) {
    try {
      return await (this.prismaService.country as any).update({
        withDeleted: true,
        where: {
          id_country: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch (error) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }
  }
}
