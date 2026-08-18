import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  // Hash password helper
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Da de alta un usuario.
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  // Lista los usuarios activos.
  findAll() {
    // Middleware automatically filters deleted_at = null
    return this.prismaService.user.findMany({
      include: {
        role: true,
      },
    });
  }

  // Lista los usuarios que fueron dados de baja.
  findDeleted() {
    // Include soft-deleted users (use withDeleted flag)
    return (this.prismaService.user.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
      withDeleted: true,
      include: {
        role: true,
      },
    });
  }

  // Busca un usuario por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { user_id: id },
      include: {
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Actualiza los datos de un usuario.
  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const dataToUpdate = { ...updateUserDto };
      
      // Si viene contraseña nueva, la guarda hasheada
      if (updateUserDto.password) {
        dataToUpdate.password = await this.hashPassword(updateUserDto.password);
      }
      
      return await this.prismaService.user.update({
        where: { user_id: id },
        data: dataToUpdate,
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Da de baja un usuario. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    // Baja lógica: el middleware convierte el delete en un update con deleted_at
    try {
      return await this.prismaService.user.delete({
        where: { user_id: id },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Vuelve a activar un usuario que estaba dado de baja.
  async restore(id: number) {
    // Restore a previously soft-deleted user
    try {
      return await (this.prismaService.user.update as any)({
        where: { user_id: id },
        data: { deleted_at: null },
        withDeleted: true, // Allow updating soft-deleted records
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Busca un usuario por su mail. Lo usa el login.
  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
    return user;
  }
}
