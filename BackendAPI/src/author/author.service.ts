import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prismaService: PrismaService) {}

  create(createAuthorDto: CreateAuthorDto) {
    return this.prismaService.author.create({
      data: createAuthorDto,
    });
  }

  findAll() {
    return this.prismaService.author.findMany({
      include: {
        _count: {
          select: {
            Taxon: true,
          },
        },
      },
    });
  }
  findDeleted() {
    return (this.prismaService.author.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  }

  async findOne(id: number) {
    const author = await this.prismaService.author.findUnique({
      where: { id_author: id },
      include: {
        Taxon: {
          select: {
            id_taxon: true,
            name: true,
          },
        },
      },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    try {
      return await this.prismaService.author.update({
        where: { id_author: id },
        data: updateAuthorDto,
      });
    } catch (error) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.author.delete({
        where: { id_author: id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Author with ID ${id} not found or has associated taxons`,
      );
    }
  }
  async restore(id: number) {
    try {
      return await (this.prismaService.author.update as any)({
        where: { id_author: id },
        data: { deleted_at: null },
        withDeleted: true,
      });
    } catch (error) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
  }

  async checkIfInUse(id: number) {
    const observations = await this.prismaService.observation.findMany({
      where: {
        deleted_at: null,
        taxon: {
          id_author: id,
        },
      },
      select: {
        id_observation: true,
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
}
