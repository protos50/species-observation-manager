import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  // Junta los números que muestra el panel principal.
  async getDashboardStats() {
    // Ejecutar todas las queries en paralelo para mejor performance
    const [taxonomy, environments, commonSpecies, byCountry] =
      await Promise.all([
        this.getTaxonomyStats(),
        this.getEnvironmentStats(),
        this.getCommonSpecies(),
        this.getStatsByCountry(),
      ]);

    return {
      taxonomy,
      environments,
      commonSpecies,
      byCountry,
    };
  }

  // Cuenta cuántos taxones hay en cada nivel de la clasificación.
  async getTaxonomyStats() {
    // Primero obtener todos los niveles para debugging
    const allLevels = await this.prisma.taxonomicLevel.findMany();
    console.log('🔍 Niveles taxonómicos disponibles:', allLevels.map(l => l.name));

    // Intentar múltiples variantes de nombres
    const [subfamilyLevel, genusLevel, speciesLevel] = await Promise.all([
      this.prisma.taxonomicLevel.findFirst({
        where: { 
          name: { 
            in: ["Subfamilia", "subfamilia", "Subfamily", "subfamily"] 
          } 
        },
      }),
      this.prisma.taxonomicLevel.findFirst({
        where: { 
          name: { 
            in: ["Género", "genero", "Genus", "genus"] 
          } 
        },
      }),
      this.prisma.taxonomicLevel.findFirst({
        where: { 
          name: { 
            in: ["Especie", "especie", "Species", "species"] 
          } 
        },
      }),
    ]);

    console.log('🔍 Niveles encontrados:', {
      subfamily: subfamilyLevel?.name,
      genus: genusLevel?.name,
      species: speciesLevel?.name
    });

    const [subfamilies, genera, species, totalObservations] = await Promise.all([
      // Contar subfamilias únicas
      this.prisma.taxon.count({
        where: {
          id_taxonomic_level: subfamilyLevel?.id_taxonomic_level,
        },
      }),

      // Contar géneros únicos
      this.prisma.taxon.count({
        where: {
          id_taxonomic_level: genusLevel?.id_taxonomic_level,
        },
      }),

      // Contar especies únicas
      this.prisma.taxon.count({
        where: {
          id_taxonomic_level: speciesLevel?.id_taxonomic_level,
        },
      }),

      // Contar total de observaciones
      this.prisma.observation.count(),
    ]);

    return {
      subfamilies,
      genera,
      species,
      totalObservations,
    };
  }

  // Cuenta las observaciones agrupadas por tipo de ambiente.
  async getEnvironmentStats() {
    // Contar observaciones agrupadas por ambiente
    const result = await this.prisma.observation.groupBy({
      by: ['id_environment'],
      _count: {
        id_observation: true,
      },
    });

    // Obtener información de los ambientes
    const environmentIds = result
      .map((r) => r.id_environment)
      .filter((id) => id !== null) as number[];

    const environments = await this.prisma.environment.findMany({
      where: {
        id_environment: {
          in: environmentIds,
        },
      },
    });

    // Mapear resultados
    const stats = result.map((item) => {
      if (item.id_environment) {
        const env = environments.find(
          (e) => e.id_environment === item.id_environment,
        );
        return {
          name: env?.environment_name || 'Sin clasificar',
          count: item._count.id_observation,
        };
      } else {
        return {
          name: 'Sin clasificar',
          count: item._count.id_observation,
        };
      }
    });

    // Ordenar de mayor a menor
    return stats.sort((a, b) => b.count - a.count);
  }

  // Arma el ranking de las especies más observadas.
  async getCommonSpecies(limit: number = 10) {
    // Agrupar observaciones por taxón
    const result = await this.prisma.observation.groupBy({
      by: ['id_taxon'],
      _count: {
        id_observation: true,
      },
      orderBy: {
        _count: {
          id_observation: 'desc',
        },
      },
      take: limit,
    });

    // Obtener información de los taxones
    const taxonIds = result.map((r) => r.id_taxon);
    const taxons = await this.prisma.taxon.findMany({
      where: {
        id_taxon: {
          in: taxonIds,
        },
      },
      select: {
        id_taxon: true,
        name: true,
      },
    });

    // Combinar datos
    return result.map((item) => {
      const taxon = taxons.find((t) => t.id_taxon === item.id_taxon);
      return {
        species: taxon?.name || 'Desconocido',
        count: item._count.id_observation,
      };
    });
  }

  // Totales agrupados por país.
  async getStatsByCountry() {
    // Obtener todas las observaciones con su localidad, provincia y país
    const observations = await this.prisma.observation.findMany({
      select: {
        id_observation: true,
        geolocation: {
          select: {
            locality: {
              select: {
                department: {
                  select: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    // Agrupar por país y provincia
    const countryMap = new Map<
      string,
      {
        id: number;
        name: string;
        count: number;
        provinces: Map<string, { id: number; name: string; count: number }>;
      }
    >();

    for (const obs of observations) {
      const province = obs.geolocation?.locality?.department?.province;
      if (province) {
        const country = province.country;
        if (country) {
          // Obtener o crear entrada de país
          let countryEntry = countryMap.get(country.country_name);
          if (!countryEntry) {
            countryEntry = {
              id: country.id_country,
              name: country.country_name,
              count: 0,
              provinces: new Map(),
            };
            countryMap.set(country.country_name, countryEntry);
          }

          // Incrementar contador de país
          countryEntry.count++;

          // Obtener o crear entrada de provincia
          let provinceEntry = countryEntry.provinces.get(province.province_name);
          if (!provinceEntry) {
            provinceEntry = {
              id: province.id_province,
              name: province.province_name,
              count: 0,
            };
            countryEntry.provinces.set(province.province_name, provinceEntry);
          }

          // Incrementar contador de provincia
          provinceEntry.count++;
        }
      }
    }

    // Convertir a array y ordenar
    return Array.from(countryMap.values())
      .map((country) => ({
        ...country,
        provinces: Array.from(country.provinces.values()).sort(
          (a, b) => b.count - a.count
        ),
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Totales de una provincia: departamentos, localidades y observaciones.
  async getProvinceStats(provinceName: string) {
    // 1. Buscar la provincia
    const province = await this.prisma.province.findFirst({
      where: {
        province_name: {
          equals: provinceName,
          mode: 'insensitive', // Case insensitive
        },
      },
      select: {
        id_province: true,
        province_name: true,
      },
    });

    if (!province) {
      throw new Error(`Provincia "${provinceName}" no encontrada`);
    }

    // 2. Obtener todas las observaciones de la provincia
    const observations = await this.prisma.observation.findMany({
      where: {
        geolocation: {
          locality: {
            department: {
              id_province: province.id_province,
            },
          },
        },
      },
      select: {
        id_observation: true,
        id_taxon: true,
        collection: {
          select: {
            collection_date: true,
          },
        },
        taxon: {
          select: {
            id_taxon: true,
            name: true,
            id_taxonomic_level: true,
            taxonomic_level: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 3. Total de observaciones
    const totalObservations = observations.length;

    // 4. Top 10 especies más observadas
    const speciesCount = new Map<number, { name: string; count: number }>();
    
    observations.forEach((obs) => {
      // Solo contar si es nivel especie
      const isSpecies = ['Especie', 'especie', 'Species', 'species'].includes(
        obs.taxon.taxonomic_level.name
      );
      
      if (isSpecies) {
        const existing = speciesCount.get(obs.id_taxon);
        if (existing) {
          existing.count++;
        } else {
          speciesCount.set(obs.id_taxon, {
            name: obs.taxon.name,
            count: 1,
          });
        }
      }
    });

    const topSpecies = Array.from(speciesCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        species: item.name,
        count: item.count,
      }));

    // 5. Total de especies únicas
    const totalSpecies = speciesCount.size;

    // 6. Total de géneros únicos
    const generaSet = new Set<number>();
    observations.forEach((obs) => {
      const isGenus = ['Género', 'genero', 'Genus', 'genus'].includes(
        obs.taxon.taxonomic_level.name
      );
      if (isGenus) {
        generaSet.add(obs.id_taxon);
      }
    });
    const totalGenera = generaSet.size;

    // 7. Cantidad de fechas únicas (salidas de campo)
    const uniqueDates = new Set<string>();
    observations.forEach((obs) => {
      if (obs.collection?.collection_date) {
        // Formatear la fecha como YYYY-MM-DD para comparación
        const dateStr = new Date(obs.collection.collection_date)
          .toISOString()
          .split('T')[0];
        uniqueDates.add(dateStr);
      }
    });
    const fieldTrips = uniqueDates.size;

    return {
      province: province.province_name,
      totalObservations,
      totalSpecies,
      totalGenera,
      fieldTrips,
      topSpecies,
    };
  }

  // Las localidades con más registros dentro de una provincia.
  async getTopLocalitiesByProvince(provinceName: string) {
    const observations = await this.prisma.observation.findMany({
      where: {
        deleted_at: null,
        geolocation: {
          locality: {
            department: {
              province: {
                province_name: {
                  equals: provinceName,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      },
      include: {
        geolocation: {
          include: {
            locality: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    });

    const localityCount = new Map<number, { name: string; department: string; count: number }>();

    observations.forEach((obs) => {
      const locality = obs.geolocation.locality;
      if (locality) {
        const existing = localityCount.get(locality.id_locality);
        if (existing) {
          existing.count += 1;
        } else {
          localityCount.set(locality.id_locality, {
            name: locality.locality_name,
            department: locality.department?.department_name || '',
            count: 1,
          });
        }
      }
    });

    return Array.from(localityCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        locality: item.name,
        department: item.department,
        observations: item.count,
      }));
  }
}
