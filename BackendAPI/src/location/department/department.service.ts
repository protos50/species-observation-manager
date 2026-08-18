import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un departamento.
  create(createDepartmentDto: CreateDepartmentDto) {
    return this.prismaService.department.create({
      data: createDepartmentDto,
    });
  }

  // Lista los departamentos activos.
  findAll() {
    return this.prismaService.department.findMany({
      include: {
        province: {
          include: {
            country: true,
          },
        },
      },
    });
  }

  // Lista los departamentos de una provincia.
  async findByProvince(provinceId: number) {
    return this.prismaService.department.findMany({
      where: {
        id_province: provinceId,
      },
      include: {
        province: true,
      },
    });
  }

  // Busca un departamento por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const department = await this.prismaService.department.findUnique({
      where: { id_department: id },
      include: {
        province: {
          include: {
            country: true,
          },
        },
        Locality: true,
      },
    });
    
    if (!department) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    
    return department;
  }

  // Actualiza los datos de un departamento.
  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      return await this.prismaService.department.update({
        where: { id_department: id },
        data: updateDepartmentDto,
      });
    } catch (error) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
  }

  // Da de baja un departamento. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.department.delete({
        where: { id_department: id },
      });
    } catch (error) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado o tiene localidades asociadas`);
    }
  }

  // Avisa si el departamento está enganchado a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    // Trae las localidades de este departamento
    const localities = await this.prismaService.locality.findMany({
      where: {
        id_department: id,
        deleted_at: null,
      },
      include: {
        Geolocation: {
          where: { deleted_at: null },
          select: { id_geolocation: true },
        },
      },
      orderBy: {
        locality_name: 'asc',
      },
    });

    // Cuenta el total de observaciones que cuelgan de toda la jerarquía
    const observations = await this.prismaService.observation.findMany({
      where: {
        deleted_at: null,
        geolocation: {
          locality: {
            id_department: id,
          },
        },
      },
      select: {
        id_observation: true,
        taxon: { select: { name: true } },
      },
    });

    return {
      inUse: localities.length > 0 || observations.length > 0,
      count: observations.length,
      localities: localities.map((l) => ({
        id_locality: l.id_locality,
        locality_name: l.locality_name,
        geolocation_count: l.Geolocation.length,
      })),
      observations: observations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
      })),
    };
  }

  // Lista los departamentos que fueron dados de baja.
  async findDeleted() {
    return await (this.prismaService.department as any).findMany({
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
        Locality: {
          select: {
            id_locality: true,
            locality_name: true,
          },
        },
      },
    });
  }

  // Vuelve a activar un departamento que estaba dado de baja.
  async restore(id: number) {
    try {
      return await (this.prismaService.department as any).update({
        withDeleted: true,
        where: {
          id_department: id,
          deleted_at: {
            not: null,
          },
        },
        data: { deleted_at: null },
      });
    } catch (error) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
  }
}
