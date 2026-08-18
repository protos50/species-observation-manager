import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta un autor.
  create(createAuthorDto: CreateAuthorDto) {
    return this.prismaService.author.create({
      data: createAuthorDto,
    });
  }

  // Lista los autores activos.
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
  // Lista los autores que fueron dados de baja.
  findDeleted() {
    return (this.prismaService.author.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  }

  // Busca un autor por id; si no lo encuentra, responde 404.
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

  // Actualiza los datos de un autor.
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

  // Da de baja un autor. Es baja lógica: el registro queda en la base con su fecha de borrado.
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
  // Vuelve a activar un autor que estaba dado de baja.
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

  // Avisa si el autor está enganchado a otros registros, así no se borra algo que todavía se usa.
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
