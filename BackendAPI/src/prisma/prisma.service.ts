import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Cliente de Prisma con baja logica, resuelta con extensiones del cliente.
 * Todas las consultas filtran solo por lo activo (deleted_at nulo).
 * Para incluir lo dado de baja, pasar { withDeleted: true }.
 * Para borrar de verdad, sin vuelta atras, pasar { forceDelete: true }.
 *
 * @example
 * // Normal query (excludes soft-deleted)
 * await prisma.user.findMany();
 *
 * @example
 * // Include soft-deleted records
 * await prisma.user.findMany({ where: {}, withDeleted: true } as any);
 *
 * @example
 * // Soft delete (default)
 * await prisma.user.delete({ where: { id: 1 } });
 *
 * @example
 * // Force permanent delete
 * await prisma.user.delete({ where: { id: 1 }, forceDelete: true } as any);
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly softDeleteModels = new Set<string>([
    'Rol',
    'User',
    'TaxonomicLevel',
    'Author',
    'Taxon',
    'Environment',
    'Caste',
    'Trap',
    'PreservationMethod',
    'Person',
    'Country',
    'Province',
    'Department',
    'Locality',
    'Geolocation',
    'ClimateData',
    'Collection',
    'Observation',
    'Service',
    'Contact',
  ]);

  constructor() {
    super();
    this.setupSoftDeleteExtension();
  }

  private setupSoftDeleteExtension() {
    // Use Client Extensions (recommended since Prisma 4.16.0)
    const self = this;
    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            if (!self.softDeleteModels.has(model)) {
              return query(args);
            }

            const customArgs = (args || {}) as Record<string, any>;
            const withDeleted = customArgs.withDeleted === true;
            const forceDelete = customArgs.forceDelete === true;

            // Limpia las banderas propias para que no lleguen a Prisma
            if ('withDeleted' in customArgs) {
              delete customArgs.withDeleted;
            }
            if ('forceDelete' in customArgs) {
              delete customArgs.forceDelete;
            }

            const modelDelegate = (self as any)[
              model.charAt(0).toLowerCase() + model.slice(1)
            ];

            if (!modelDelegate) {
              return query(customArgs);
            }

            // Convierte los borrados en baja lógica
            if (operation === 'delete' && !forceDelete) {
              const { where, ...rest } = customArgs;
              return modelDelegate.update({
                where,
                data: { deleted_at: new Date() },
                ...rest,
              });
            }

            if (operation === 'deleteMany' && !forceDelete) {
              const { where } = customArgs;
              return modelDelegate.updateMany({
                where,
                data: { deleted_at: new Date() },
              });
            }

            // En las lecturas descarta lo dado de baja, salvo que pidan incluirlo
            if (
              !withDeleted &&
              ['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy', 'update', 'updateMany', 'upsert'].includes(operation)
            ) {
              const where = customArgs.where || {};
              if (where.deleted_at === undefined) {
                customArgs.where = {
                  ...where,
                  deleted_at: null,
                };
              }
            }

            return query(customArgs);
          },
        },
      },
    });

    // Castea antes de asignar para que no proteste el tipado
    Object.assign(this, extended);
  }

  // Abre la conexión con la base cuando arranca la aplicación.
  async onModuleInit() {
    await this.$connect();
  }
}
