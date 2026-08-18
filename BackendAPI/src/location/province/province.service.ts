import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProvinceService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta una provincia.
  create(createProvinceDto: CreateProvinceDto) {
    return this.prismaService.province.create({
      data: createProvinceDto,
    });
  }

  // Lista las provincias activas.
  findAll() {
    return this.prismaService.province.findMany({
      include: {
        country: true,
      },
    });
  }

  // Lista las provincias de un país.
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

  // Busca una provincia por id; si no lo encuentra, responde 404.
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

  // Actualiza los datos de una provincia.
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

  // Da de baja una provincia. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.province.delete({
        where: { id_province: id },
      });
    } catch (error) {
      throw new NotFoundException(`Provincia con ID ${id} no encontrada o tiene departamentos asociados`);
    }
  }

  // Avisa si la provincia está enganchada a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    // Trae los departamentos de esta provincia
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

    // Cuenta el total de observaciones que cuelgan de toda la jerarquía
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

  // Lista las provincias que fueron dadas de baja.
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

  // Vuelve a activar una provincia que estaba dada de baja.
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
