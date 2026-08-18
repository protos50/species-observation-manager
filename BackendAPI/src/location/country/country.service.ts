import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CountryService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un país.
  create(createCountryDto: CreateCountryDto) {
    return this.prismaService.country.create({
      data: createCountryDto,
    });
  }

  // Lista los países activos.
  findAll() {
    return this.prismaService.country.findMany();
  }

  // Busca un país por id; si no lo encuentra, responde 404.
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

  // Actualiza los datos de un país.
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

  // Da de baja un país. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.country.delete({
        where: { id_country: id },
      });
    } catch (error) {
      throw new NotFoundException(`País con ID ${id} no encontrado o tiene provincias asociadas`);
    }
  }

  // Avisa si el país está enganchado a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    // Trae las provincias de este país
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

    // Cuenta el total de observaciones que cuelgan de toda la jerarquía
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

  // Lista los países que fueron dados de baja.
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

  // Vuelve a activar un país que estaba dado de baja.
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
