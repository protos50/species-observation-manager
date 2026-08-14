import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolService {

  constructor(private prismaService: PrismaService){}

  create(createRolDto: CreateRolDto) {
    return this.prismaService.rol.create({
      data: createRolDto,
    });
  }

  findAll() {
    return this.prismaService.rol.findMany();
  }

  async findOne(id: number) {
    const rolFound = await this.prismaService.rol.findUnique({
      where: { role_id: id },
    });
    if (!rolFound) {
      throw new NotFoundException('El rol con el id: ' + id + ' no existe');
    }
    return rolFound;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const updatedRol = await this.prismaService.rol.update({
      where: { role_id: id },
      data: updateRolDto,
    });
    if (!updatedRol) {
      throw new NotFoundException('El rol con el id: ' + id + ' no existe');
    }
    return updatedRol;
  }
  
  async remove(id: number) {
    const deletedRol = await this.prismaService.rol.delete({
      where: { role_id: id },
    });
    if (!deletedRol) {
      throw new NotFoundException('El rol con el id: ' + id + ' no existe');
    }
    return deletedRol;
  }
}
