import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PersonService {
  constructor(private prismaService: PrismaService) {}

  // Da de alta una persona.
  create(createPersonDto: CreatePersonDto) {
    return this.prismaService.person.create({
      data: createPersonDto,
    });
  }

  // Lista las personas activas.
  findAll() {
    return this.prismaService.person.findMany({
      include: {
        Collection: true,
      },
    });
  }

  // Lista las personas que fueron dadas de baja.
  findDeleted() {
    return this.prismaService.person.findMany({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  }

  // Busca una persona por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    const person = await this.prismaService.person.findUnique({
      where: { id_person: id },
      include: {
        Collection: true,
      },
    });

    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return person;
  }

  // Actualiza los datos de una persona.
  async update(id: number, updatePersonDto: UpdatePersonDto) {
    try {
      return await this.prismaService.person.update({
        where: { id_person: id },
        data: updatePersonDto,
      });
    } catch (error) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
  }

  // Da de baja una persona. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    try {
      return await this.prismaService.person.delete({
        where: { id_person: id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Persona con ID ${id} no encontrada o tiene registros asociados`,
      );
    }
  }

  // Vuelve a activar una persona que estaba dada de baja.
  async restore(id: number) {
    try {
      return await (this.prismaService.person.update as any)({
        where: { id_person: id },
        data: { deleted_at: null },
        withDeleted: true,
      });
    } catch (error) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
  }

  // Avisa si la persona está enganchada a otros registros, así no se borra algo que todavía se usa.
  async checkIfInUse(id: number) {
    // Fija si la persona figura como colector en alguna colección
    const collectionsAsCollector = await this.prismaService.collection.findMany(
      {
        where: {
          id_person: id,
          deleted_at: null,
        },
        include: {
          Observation: {
            where: {
              deleted_at: null,
            },
            include: {
              taxon: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    );

    // Fija si la persona figura como identificador en alguna observación
    const observationsAsIdentifier =
      await this.prismaService.observation.findMany({
        where: {
          id_identifier: id,
          deleted_at: null,
        },
        include: {
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

    // Arma la lista de observaciones con la fecha de colecta de cada una
    const observationsFromCollections = collectionsAsCollector.flatMap((c) =>
      c.Observation.map((obs) => ({
        ...obs,
        collection_date: c.collection_date,
      })),
    );

    // Combine both sources
    const allObservations = [
      ...observationsFromCollections,
      ...observationsAsIdentifier,
    ];

    // Saca los repetidos
    const uniqueObservations = Array.from(
      new Map(allObservations.map((obs) => [obs.id_observation, obs])).values(),
    );

    return {
      inUse: uniqueObservations.length > 0,
      count: uniqueObservations.length,
      observations: uniqueObservations.map((obs) => ({
        id_observation: obs.id_observation,
        taxon_name: obs.taxon?.name,
        collection_date:
          'collection_date' in obs
            ? obs.collection_date
            : obs.collection?.collection_date,
      })),
    };
  }

  // Métodos adicionales eliminados ya que los modelos personRole e identifier son obsoletos
}
