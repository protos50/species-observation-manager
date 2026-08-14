import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private prismaService: PrismaService) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    return this.prismaService.department.create({
      data: createDepartmentDto,
    });
  }

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

  async remove(id: number) {
    try {
      return await this.prismaService.department.delete({
        where: { id_department: id },
      });
    } catch (error) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado o tiene localidades asociadas`);
    }
  }

  async checkIfInUse(id: number) {
    // Get localities for this department
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

    // Count total observations through the hierarchy
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
