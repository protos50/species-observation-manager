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

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    // Middleware automatically filters deleted_at = null
    return this.prismaService.user.findMany({
      include: {
        role: true,
      },
    });
  }

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

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const dataToUpdate = { ...updateUserDto };
      
      // Hash password if it's being updated
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

  async remove(id: number) {
    // Soft delete: middleware converts delete to update with deleted_at
    try {
      return await this.prismaService.user.delete({
        where: { user_id: id },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

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
