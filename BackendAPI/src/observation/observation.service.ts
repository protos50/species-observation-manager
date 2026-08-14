import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCollectionObservationDto } from './dto/create-collection-observation.dto';
import { SearchObservationDto } from './dto/search-observation.dto';
import { ExportCsvDto } from './dto/export-csv.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ObservationService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Create a new collection and observation using Prisma transaction
   * All fields are now properly integrated with the new schema
   */
  async createCollectionAndObservation(
    createDto: CreateCollectionObservationDto,
  ) {
    try {
      // Use Prisma transaction to create collection and observation atomically
      const result = await this.prismaService.$transaction(async (prisma) => {
        // Create collection
        const collection = await prisma.collection.create({
          data: {
            id_person: createDto.id_person,
            id_preservation_method: createDto.id_preservation_method,
            id_trap: createDto.id_trap,
            collection_date: createDto.collection_date,
            trap_number: createDto.trap_number,
          },
        });

        // Determine climate data (only if geolocation/locality has a matching date)
        let climateDataId: number | undefined;
        if (createDto.id_geolocation) {
          const geolocation = await prisma.geolocation.findUnique({
            where: { id_geolocation: createDto.id_geolocation },
            select: { id_locality: true },
          });

          if (!geolocation) {
            throw new BadRequestException(
              `Geolocation with ID ${createDto.id_geolocation} not found`,
            );
          }

          // Prisma @db.Date ignores time part, ensure we look up by date component only
          // Extraer fecha del ISO string y parsear directamente
          const dateStr = createDto.collection_date.toString().split('T')[0]; // "YYYY-MM-DD"
          const [year, month, day] = dateStr.split('-').map(Number);
          const normalizedDate = new Date(Date.UTC(year, month - 1, day));

          const climateData = await prisma.climateData.findUnique({
            where: {
              id_locality_climate_date: {
                id_locality: geolocation.id_locality,
                climate_date: normalizedDate,
              },
            },
            select: { id_climate_data: true },
          });

          if (climateData) {
            climateDataId = climateData.id_climate_data;
          }
        }

        // Create observation linked to the collection
        const observation = await prisma.observation.create({
          data: {
            id_taxon: createDto.id_taxon,
            id_collection: collection.id_collection,
            id_geolocation: createDto.id_geolocation,
            id_environment: createDto.id_environment,
            id_caste: createDto.id_caste,
            id_climate_data: climateDataId,
            abundance: createDto.abundance,
            id_identifier: createDto.id_identifier,
            identification_date: createDto.identification_date,
            id_confirmer: createDto.id_confirmer,
            confirmation_date: createDto.confirmation_date,
            biology_notes: createDto.biology_notes,
            general_observations: createDto.general_observations,
            conservation_status: createDto.conservation_status,
          },
        });

        return observation;
      });

      // Fetch and return the full observation details with all relations
      return this.findOne(result.id_observation);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create collection and observation: ${error.message}`,
      );
    }
  }

  /**
   * Get all observations with detailed information and pagination
   */
  async findAll(page: number = 1, limit: number = 10) {
    try {
      // Ensure parameters are numbers (query params come as strings)
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Get total count for pagination metadata
      const totalCount = await this.prismaService.observation.count();

      // Get observations with full details (same includes as findOne)
      const observations = await this.prismaService.observation.findMany({
        skip,
        take: limitNum,
        include: {
          taxon: {
            include: {
              taxonomic_level: true,
              author: true,
            },
          },
          geolocation: {
            include: {
              locality: {
                include: {
                  department: {
                    include: {
                      province: {
                        include: {
                          country: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          environment: true,
          caste: true,
          climate_data: true,
          identifier: true,
          confirmer: true,
          collection: {
            include: {
              person: true,
              preservation_method: true,
              trap: true,
            },
          },
        },
        orderBy: {
          id_observation: 'desc', // Most recent first
        },
      });

      const totalPages = Math.ceil(totalCount / limitNum);

      return {
        data: observations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve observations: ${error.message}`,
      );
    }
  }

  /**
   * Get detailed information about a specific observation
   */
  async findOne(id: number) {
    const observation = await this.prismaService.observation.findUnique({
      where: { id_observation: id },
      include: {
        taxon: {
          include: {
            taxonomic_level: true,
            author: true,
          },
        },
        geolocation: {
          include: {
            locality: {
              include: {
                department: {
                  include: {
                    province: {
                      include: {
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        environment: true,
        caste: true,
        climate_data: true,
        identifier: true,
        confirmer: true,
        collection: {
          include: {
            person: true,
            preservation_method: true,
            trap: true,
          },
        },
      },
    });

    if (!observation) {
      throw new NotFoundException(`Observation with ID ${id} not found`);
    }

    return observation;
  }

  /**
   * Search observations by various criteria with full nested data and pagination
   */
  async searchObservations(searchDto: SearchObservationDto) {
    try {
      // Ensure parameters are numbers (query params come as strings)
      const pageNum = Number(searchDto.page) || 1;
      const limitNum = Number(searchDto.limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Build dynamic where clause based on search parameters
      const where: any = {};
      const conditions: any[] = [];

      // Quick global search across múltiples campos (taxon, ubicación, personas, ambiente, fechas, coords, etc.)
      if (searchDto.q) {
        const qRaw = searchDto.q.toString().trim();
        if (qRaw) {
          const orConditions: any[] = [];

          // 1) Interpretar años (YYYY) y fechas en formato DD/MM/YYYY
          const yearMatch = qRaw.match(/^\d{4}$/);
          if (yearMatch) {
            const year = parseInt(yearMatch[0], 10);
            if (year >= 1000 && year <= 9999) {
              const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
              const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
              orConditions.push({
                collection: {
                  collection_date: {
                    gte: start.toISOString(),
                    lte: end.toISOString(),
                  },
                },
              });
            }
          } else {
            const dateMatch = qRaw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
            if (dateMatch) {
              const day = parseInt(dateMatch[1], 10);
              const month = parseInt(dateMatch[2], 10) - 1;
              const year = parseInt(dateMatch[3], 10);
              const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
              const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
              orConditions.push({
                collection: {
                  collection_date: {
                    gte: start.toISOString(),
                    lte: end.toISOString(),
                  },
                },
              });
            }
          }

          // 2) Interpretar coordenadas: uno o dos números (lat, lon) con tolerancia
          const numberMatches = qRaw.match(/-?\d+(?:\.\d+)?/g);
          if (numberMatches && numberMatches.length > 0) {
            const radiusMeters = 1000; // ~1000m de radio para coordenadas
            const radiusInDegrees = radiusMeters / 111000; // aprox

            if (numberMatches.length >= 2) {
              const lat = parseFloat(numberMatches[0]);
              const lng = parseFloat(numberMatches[1]);
              orConditions.push({
                geolocation: {
                  AND: [
                    {
                      latitude: {
                        gte: lat - radiusInDegrees,
                        lte: lat + radiusInDegrees,
                      },
                    },
                    {
                      longitude: {
                        gte: lng - radiusInDegrees,
                        lte: lng + radiusInDegrees,
                      },
                    },
                  ],
                },
              });
            } else if (numberMatches.length === 1) {
              const coord = parseFloat(numberMatches[0]);
              orConditions.push({
                geolocation: {
                  OR: [
                    {
                      latitude: {
                        gte: coord - radiusInDegrees,
                        lte: coord + radiusInDegrees,
                      },
                    },
                    {
                      longitude: {
                        gte: coord - radiusInDegrees,
                        lte: coord + radiusInDegrees,
                      },
                    },
                  ],
                },
              });
            }
          }

          const q = qRaw;

          // 3) Coincidencias de texto en múltiples campos

          // Taxon name y autor
          orConditions.push({
            taxon: {
              OR: [
                {
                  name: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  author: {
                    author_name: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            },
          });

          // Locality / department / province / country
          orConditions.push({
            geolocation: {
              locality: {
                OR: [
                  {
                    locality_name: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                  {
                    department: {
                      department_name: {
                        contains: q,
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    department: {
                      province: {
                        OR: [
                          {
                            province_name: {
                              contains: q,
                              mode: 'insensitive',
                            },
                          },
                          {
                            country: {
                              country_name: {
                                contains: q,
                                mode: 'insensitive',
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          });

          // Collector (person)
          orConditions.push({
            collection: {
              person: {
                OR: [
                  {
                    person_name: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                  {
                    person_lastname: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          });

          // Identifier
          orConditions.push({
            identifier: {
              OR: [
                {
                  person_name: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  person_lastname: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          });

          // Confirmer
          orConditions.push({
            confirmer: {
              OR: [
                {
                  person_name: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  person_lastname: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          });

          // Environment name
          orConditions.push({
            environment: {
              environment_name: {
                contains: q,
                mode: 'insensitive',
              },
            },
          });

          // Casta
          orConditions.push({
            caste: {
              caste_name: {
                contains: q,
                mode: 'insensitive',
              },
            },
          });

          // Estado de conservación
          orConditions.push({
            conservation_status: {
              contains: q,
              mode: 'insensitive',
            },
          });

          // Tag de geolocalización
          orConditions.push({
            geolocation: {
              tag: {
                contains: q,
                mode: 'insensitive',
              },
            },
          });

          // Medio de obtención del GPS (source_type)
          orConditions.push({
            geolocation: {
              source_type: {
                contains: q,
                mode: 'insensitive',
              },
            },
          });

          // Método de preservación
          orConditions.push({
            collection: {
              preservation_method: {
                method_name: {
                  contains: q,
                  mode: 'insensitive',
                },
              },
            },
          });

          // Tipo de trampa
          orConditions.push({
            collection: {
              trap: {
                trap_name: {
                  contains: q,
                  mode: 'insensitive',
                },
              },
            },
          });

          if (orConditions.length > 0) {
            conditions.push({ OR: orConditions });
          }
        }
      }

      // Filter by taxon ID or name
      if (searchDto.taxon_id || searchDto.taxon_name) {
        const taxonCondition: any = {};
        if (searchDto.taxon_id) taxonCondition.id_taxon = searchDto.taxon_id;
        if (searchDto.taxon_name)
          taxonCondition.name = {
            contains: searchDto.taxon_name,
            mode: 'insensitive',
          };
        conditions.push({ taxon: taxonCondition });
      }

      // Filter by taxonomic level
      if (searchDto.taxonomic_level) {
        conditions.push({
          taxon: {
            taxonomic_level: {
              name: {
                contains: searchDto.taxonomic_level,
                mode: 'insensitive',
              },
            },
          },
        });
      }

      // Filter by locality ID or name (with nested geographic search)
      if (
        searchDto.locality_id ||
        searchDto.locality_name ||
        searchDto.department_name ||
        searchDto.province_name ||
        searchDto.country_name
      ) {
        let localityCondition: any = {};

        if (searchDto.locality_id) {
          localityCondition.id_locality = searchDto.locality_id;
        } else {
          // Build nested geographic conditions
          const geographicConditions: any = {};

          if (searchDto.locality_name) {
            geographicConditions.locality_name = {
              contains: searchDto.locality_name,
              mode: 'insensitive',
            };
          }

          if (
            searchDto.department_name ||
            searchDto.province_name ||
            searchDto.country_name
          ) {
            const departmentCondition: any = {};

            if (searchDto.department_name) {
              departmentCondition.department_name = {
                contains: searchDto.department_name,
                mode: 'insensitive',
              };
            }

            if (searchDto.province_name || searchDto.country_name) {
              const provinceCondition: any = {};

              if (searchDto.province_name) {
                provinceCondition.province_name = {
                  contains: searchDto.province_name,
                  mode: 'insensitive',
                };
              }

              if (searchDto.country_name) {
                provinceCondition.country = {
                  country_name: {
                    contains: searchDto.country_name,
                    mode: 'insensitive',
                  },
                };
              }

              departmentCondition.province = provinceCondition;
            }

            geographicConditions.department = departmentCondition;
          }

          localityCondition = geographicConditions;
        }

        conditions.push({
          geolocation: { locality: localityCondition },
        });
      }

      // Filter by geolocation tag
      if (searchDto.geolocation_tag) {
        conditions.push({
          geolocation: {
            tag: {
              contains: searchDto.geolocation_tag,
              mode: 'insensitive',
            },
          },
        });
      }

      // Filter by collector/person ID or name
      if (searchDto.collector_id || searchDto.person_name) {
        const personCondition: any = {};

        if (searchDto.collector_id) {
          personCondition.id_person = searchDto.collector_id;
        }

        if (searchDto.person_name) {
          personCondition.OR = [
            {
              person_name: {
                contains: searchDto.person_name,
                mode: 'insensitive',
              },
            },
            {
              person_lastname: {
                contains: searchDto.person_name,
                mode: 'insensitive',
              },
            },
          ];
        }

        conditions.push({ collection: { person: personCondition } });
      }

      // Filter by confirmer ID or name
      if (searchDto.confirmer_id || searchDto.confirmer_name) {
        const confirmerCondition: any = {};

        if (searchDto.confirmer_id) {
          confirmerCondition.id_person = searchDto.confirmer_id;
        }

        if (searchDto.confirmer_name) {
          confirmerCondition.OR = [
            {
              person_name: {
                contains: searchDto.confirmer_name,
                mode: 'insensitive',
              },
            },
            {
              person_lastname: {
                contains: searchDto.confirmer_name,
                mode: 'insensitive',
              },
            },
          ];
        }

        conditions.push({ confirmer: confirmerCondition });
      }

      // Filter by identifier ID or name
      if (searchDto.identifier_id || searchDto.identifier_name) {
        const identifierCondition: any = {};

        if (searchDto.identifier_id) {
          identifierCondition.id_person = searchDto.identifier_id;
        }

        if (searchDto.identifier_name) {
          identifierCondition.OR = [
            {
              person_name: {
                contains: searchDto.identifier_name,
                mode: 'insensitive',
              },
            },
            {
              person_lastname: {
                contains: searchDto.identifier_name,
                mode: 'insensitive',
              },
            },
          ];
        }

        conditions.push({ identifier: identifierCondition });
      }

      // Filter by caste name
      if (searchDto.caste) {
        conditions.push({
          caste: {
            caste_name: {
              contains: searchDto.caste,
              mode: 'insensitive',
            },
          },
        });
      }

      // Filter by environment name
      if (searchDto.environment_name) {
        conditions.push({
          environment: {
            environment_name: {
              contains: searchDto.environment_name,
              mode: 'insensitive',
            },
          },
        });
      }

      // Filter by conservation status
      if (searchDto.conservation_status) {
        conditions.push({
          conservation_status: {
            contains: searchDto.conservation_status,
            mode: 'insensitive',
          },
        });
      }

      // Filter by abundance range
      if (searchDto.min_abundance !== undefined || searchDto.max_abundance !== undefined) {
        const abundanceCondition: any = {};
        if (searchDto.min_abundance !== undefined) {
          abundanceCondition.gte = Number(searchDto.min_abundance);
        }
        if (searchDto.max_abundance !== undefined) {
          abundanceCondition.lte = Number(searchDto.max_abundance);
        }
        conditions.push({ abundance: abundanceCondition });
      }

      // Filter by date range
      if (searchDto.start_date || searchDto.end_date) {
        const dateCondition: any = {};
        if (searchDto.start_date) {
          // Convert date string to ISO-8601 DateTime format
          const startDate = new Date(searchDto.start_date);
          startDate.setHours(0, 0, 0, 0);
          dateCondition.gte = startDate.toISOString();
        }
        if (searchDto.end_date) {
          // Convert date string to ISO-8601 DateTime format (end of day)
          const endDate = new Date(searchDto.end_date);
          endDate.setHours(23, 59, 59, 999);
          dateCondition.lte = endDate.toISOString();
        }

        conditions.push({ collection: { collection_date: dateCondition } });
      }

      // Filter by coordinates (latitude and/or longitude)
      // Radio is optional, defaults to 10m if not provided for practical matching
      if (searchDto.latitude || searchDto.longitude) {
        const geolocationConditions: any[] = [];

        if (searchDto.latitude) {
          const lat = parseFloat(searchDto.latitude.toString());
          // Use radius if provided, otherwise default to 10m for practical matching
          const radius = searchDto.radius 
            ? parseFloat(searchDto.radius.toString()) 
            : 10; // 10m tolerance for practical coordinate matching
          const radiusInDegrees = radius / 111000;

          geolocationConditions.push(
            { latitude: { gte: lat - radiusInDegrees } },
            { latitude: { lte: lat + radiusInDegrees } }
          );
        }

        if (searchDto.longitude) {
          const lng = parseFloat(searchDto.longitude.toString());
          // Use radius if provided, otherwise default to 10m for practical matching
          const radius = searchDto.radius 
            ? parseFloat(searchDto.radius.toString()) 
            : 10; // 10m tolerance for practical coordinate matching
          const radiusInDegrees = radius / 111000;

          geolocationConditions.push(
            { longitude: { gte: lng - radiusInDegrees } },
            { longitude: { lte: lng + radiusInDegrees } }
          );
        }

        if (geolocationConditions.length > 0) {
          conditions.push({
            geolocation: {
              AND: geolocationConditions,
            },
          });
        }
      }

      // Combine all conditions with AND logic
      if (conditions.length > 0) {
        where.AND = conditions;
      }

      // Get total count for pagination metadata
      const totalCount = await this.prismaService.observation.count({ where });

      // Get observations with full details (same includes as findAll)
      const observations = await this.prismaService.observation.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          taxon: {
            include: {
              taxonomic_level: true,
              author: true,
            },
          },
          geolocation: {
            include: {
              locality: {
                include: {
                  department: {
                    include: {
                      province: {
                        include: {
                          country: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          environment: true,
          caste: true,
          climate_data: true,
          identifier: true,
          confirmer: true,
          collection: {
            include: {
              person: true,
              preservation_method: true,
              trap: true,
            },
          },
        },
        orderBy: {
          id_observation: 'desc', // Most recent first
        },
      });

      const totalPages = Math.ceil(totalCount / limitNum);

      return {
        data: observations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        filters: searchDto, // Include applied filters for reference
      };
    } catch (error) {
      throw new BadRequestException(`Search failed: ${error.message}`);
    }
  }

  /**
   * Find observations by taxon ID
   */
  async findByTaxon(taxonId: number) {
    return this.searchObservations({ taxon_id: taxonId });
  }

  /**
   * Find observations by locality ID
   */
  async findByLocality(localityId: number) {
    return this.searchObservations({ locality_id: localityId });
  }

  /**
   * Find observations related to a specific collection
   * Since collections and observations have a 1:1 relationship in our schema,
   * this function returns a specific observation.
   */
  async findByCollection(collectionId: number) {
    try {
      // Find the observation that has this collection ID
      const observation = await this.prismaService.observation.findFirst({
        where: { id_collection: collectionId },
      });

      if (!observation) {
        throw new NotFoundException(
          `No observation found for collection ID ${collectionId}`,
        );
      }

      // Get full details using consistent Prisma method
      return this.findOne(observation.id_observation);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to find observation by collection: ${error.message}`,
      );
    }
  }

  /**
   * Update observation using Prisma direct
   */
  async update(id: number, updateObservationDto: UpdateObservationDto) {
    try {
      // Get the observation first to find the collection ID
      const observation = await this.prismaService.observation.findUnique({
        where: { id_observation: id },
      });

      if (!observation) {
        throw new NotFoundException(`Observation with ID ${id} not found`);
      }

      // Extract trap_number if present (it belongs to Collection, not Observation)
      const { trap_number, ...observationData } = updateObservationDto as any;

      // Use transaction to update both observation and collection
      await this.prismaService.$transaction(async (prisma) => {
        // Get current collection to check for date/geolocation changes
        const collection = await prisma.collection.findUnique({
          where: { id_collection: observation.id_collection },
        });

        // Get current geolocation to check for locality changes
        const currentGeolocation = await prisma.geolocation.findUnique({
          where: { id_geolocation: observation.id_geolocation },
          include: { locality: true },
        });

        // Determine if we need to validate climate_data
        // This happens if EITHER geolocation OR collection_date changes
        const geolocationChanged = observationData.id_geolocation !== undefined;
        
        // Check if collection_date is being updated (it's in the collection, not observation)
        // We need to check if trap_number is being updated, which means collection is being modified
        const collectionDateChanged = trap_number !== undefined;

        if ((geolocationChanged || collectionDateChanged) && collection && currentGeolocation) {
          // Get the new geolocation if it changed
          let newGeolocation: any = currentGeolocation;
          if (geolocationChanged) {
            newGeolocation = await prisma.geolocation.findUnique({
              where: { id_geolocation: observationData.id_geolocation },
              include: { locality: true },
            });
          }

          // Use current collection date (collection_date is not updatable via observation update)
          const collectionDate = collection.collection_date;

          if (newGeolocation && newGeolocation.locality && collectionDate) {
            // Try to find climate data for the new locality + date combination
            const climateData = await prisma.climateData.findFirst({
              where: {
                id_locality: newGeolocation.locality.id_locality,
                climate_date: collectionDate,
              },
            });

            // If no climate data exists for this locality + date combination, clear the reference
            if (!climateData) {
              observationData.id_climate_data = null;
            } else {
              observationData.id_climate_data = climateData.id_climate_data;
            }
          }
        }

        // Update observation fields
        await prisma.observation.update({
          where: { id_observation: id },
          data: observationData,
        });

        // Update collection if trap_number is provided
        if (trap_number !== undefined) {
          await prisma.collection.update({
            where: { id_collection: observation.id_collection },
            data: { trap_number: trap_number },
          });
        }
      });

      // Get the updated observation with all relations
      return this.findOne(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Observation with ID ${id} not found`);
      }
      throw new BadRequestException(
        `Failed to update observation: ${error.message}`,
      );
    }
  }

  /**
   * Remove observation and its associated collection using Prisma transaction
   */
  async remove(id: number) {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        // Get observation to find associated collection
        const observation = await prisma.observation.findUnique({
          where: { id_observation: id },
        });

        if (!observation) {
          throw new NotFoundException(`Observation with ID ${id} not found`);
        }

        // Delete observation first (FK constraint)
        await prisma.observation.delete({
          where: { id_observation: id },
        });

        // Delete associated collection
        await prisma.collection.delete({
          where: { id_collection: observation.id_collection },
        });
      });

      return {
        success: true,
        message: `Observation with ID ${id} and its associated collection have been deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Observation with ID ${id} not found or could not be deleted`,
      );
    }
  }

  /**
   * Build complete taxonomic hierarchy for a given taxon
   * Navigates up the parent chain to get all taxonomic levels
   */
  private async buildTaxonomicHierarchy(taxonId: number) {
    const hierarchy = {
      reino: '',
      phylum: '',
      clase: '',
      orden: '',
      familia: '',
      subfamilia: '',
      tribu: '',
      genero: '',
      especie: '',
    };

    try {
      // Get the complete taxonomic chain from this taxon up to root
      let currentTaxon = await this.prismaService.taxon.findUnique({
        where: { id_taxon: taxonId },
        include: {
          taxonomic_level: true,
          parent: {
            include: {
              taxonomic_level: true,
              parent: {
                include: {
                  taxonomic_level: true,
                  parent: {
                    include: {
                      taxonomic_level: true,
                      parent: {
                        include: {
                          taxonomic_level: true,
                          parent: {
                            include: {
                              taxonomic_level: true,
                              parent: {
                                include: {
                                  taxonomic_level: true,
                                  parent: {
                                    include: {
                                      taxonomic_level: true,
                                      parent: {
                                        include: {
                                          taxonomic_level: true,
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
                  },
                },
              },
            },
          },
        },
      });

      // Build hierarchy by traversing from current taxon up to root
      const taxonChain: Array<{ name: string; level: string }> = [];
      while (currentTaxon) {
        taxonChain.push({
          name: currentTaxon.name,
          level: currentTaxon.taxonomic_level?.name?.toLowerCase() || '',
        });
        currentTaxon = currentTaxon.parent;
      }

      // Map taxon names to their appropriate hierarchy levels
      taxonChain.forEach((taxon) => {
        const level = taxon.level;
        if (level === 'kingdom' || level === 'reino') {
          hierarchy.reino = taxon.name;
        } else if (level === 'phylum') {
          hierarchy.phylum = taxon.name;
        } else if (level === 'class' || level === 'clase') {
          hierarchy.clase = taxon.name;
        } else if (level === 'order' || level === 'orden') {
          hierarchy.orden = taxon.name;
        } else if (level === 'family' || level === 'familia') {
          hierarchy.familia = taxon.name;
        } else if (level === 'subfamily' || level === 'subfamilia') {
          hierarchy.subfamilia = taxon.name;
        } else if (level === 'tribe' || level === 'tribu') {
          hierarchy.tribu = taxon.name;
        } else if (
          level === 'genus' ||
          level === 'genero' ||
          level === 'género'
        ) {
          hierarchy.genero = taxon.name;
        } else if (level === 'species' || level === 'especie') {
          hierarchy.especie = taxon.name;
        }
      });

      return hierarchy;
    } catch (error) {
      console.error('Error building taxonomic hierarchy:', error);
      return hierarchy; // Return empty hierarchy on error
    }
  }

  /**
   * Export observations data for R analytics in CSV format
   * Replicates original Excel structure for compatibility
   */
  async exportToCsv(filters?: ExportCsvDto) {
    try {
      // Build dynamic where clause based on filters
      const where: any = {};

      if (filters?.taxon_name) {
        where.taxon = {
          name: { contains: filters.taxon_name, mode: 'insensitive' },
        };
      }

      if (filters?.locality_name) {
        where.geolocation = {
          locality: {
            locality_name: {
              contains: filters.locality_name,
              mode: 'insensitive',
            },
          },
        };
      }

      if (filters?.environment_name) {
        where.environment = {
          environment_name: {
            contains: filters.environment_name,
            mode: 'insensitive',
          },
        };
      }

      if (filters?.start_date || filters?.end_date) {
        const dateCondition: any = {};
        if (filters.start_date) {
          const startDate = new Date(filters.start_date);
          startDate.setHours(0, 0, 0, 0);
          dateCondition.gte = startDate.toISOString();
        }
        if (filters.end_date) {
          const endDate = new Date(filters.end_date);
          endDate.setHours(23, 59, 59, 999);
          dateCondition.lte = endDate.toISOString();
        }
        where.collection = { collection_date: dateCondition };
      }

      // Get all observations with complete nested data
      const observations = await this.prismaService.observation.findMany({
        where,
        include: {
          taxon: {
            include: {
              taxonomic_level: true,
              author: true,
            },
          },
          geolocation: {
            include: {
              locality: {
                include: {
                  department: {
                    include: {
                      province: {
                        include: {
                          country: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          environment: true,
          caste: true,
          identifier: true,
          confirmer: true,
          climate_data: true,
          collection: {
            include: {
              person: true,
              preservation_method: true,
              trap: true,
            },
          },
        },
        orderBy: {
          id_observation: 'asc',
        },
      });

      // Transform data to match original Excel structure with full taxonomy hierarchy
      const csvData = await Promise.all(
        observations.map(async (obs) => {
          // Get full taxonomic hierarchy for this taxon
          const hierarchy = await this.buildTaxonomicHierarchy(
            obs.taxon.id_taxon,
          );

          // Get identifier person info
          const identifier = obs.identifier;
          const identifierName = identifier
            ? `${identifier.person_name} ${identifier.person_lastname}`.trim()
            : '';

          // Get climate data if exists
          const climate = obs.climate_data;

          // Get caste info
          const casteName = obs.caste?.caste_name || '';

          // Get author info from species taxon
          const authorInfo = obs.taxon.author
            ? `${obs.taxon.author.author_name}${obs.taxon.description_year ? `, ${obs.taxon.description_year}` : ''}`
            : '';

          return {
            // Original Excel column order
            CODIGO: `DDL_${String(obs.id_observation).padStart(7, '0')}`,
            identificacion: identifierName,
            fecha_de_ident: obs.identification_date
              ? new Date(obs.identification_date).toLocaleDateString('es-AR')
              : '',

            // Full taxonomic hierarchy (like original Excel)
            reino: hierarchy.reino || '',
            phylum: hierarchy.phylum || '',
            clase: hierarchy.clase || '',
            orden: hierarchy.orden || '',
            familia: hierarchy.familia || '',
            subfamilia: hierarchy.subfamilia || '',
            tribu: hierarchy.tribu || '',
            genero: hierarchy.genero || '',
            especie: hierarchy.especie || '',
            autor: authorInfo,
            año: obs.taxon.description_year || '',

            // Collection details
            tipo_de_trampa: obs.collection.trap?.trap_name || '',
            nro_trampa: obs.collection.trap_number || '',
            fecha_de_colecta: obs.collection.collection_date
              ? new Date(obs.collection.collection_date).toLocaleDateString(
                  'es-AR',
                )
              : '',
            recolector: obs.collection.person
              ? `${obs.collection.person.person_name} ${obs.collection.person.person_lastname}`.trim()
              : '',

            // Location hierarchy
            localidad: obs.geolocation?.locality.locality_name || '',
            departamento:
              obs.geolocation?.locality.department?.department_name || '',
            provincia:
              obs.geolocation?.locality.department?.province?.province_name ||
              '',

            // Environment and habitat
            ambiente: obs.environment?.environment_name || '',

            // Geolocation
            latitud: obs.geolocation?.latitude || '',
            longitud: obs.geolocation?.longitude || '',
            altitud: obs.geolocation?.altitude || '',
            obt_gps: obs.geolocation?.source_type || '',
            ihh: obs.geolocation?.ihh || '',
            dist_al_rio: obs.geolocation?.distance_to_river || '',

            // Observation details
            abundancia: obs.abundance || '',
            casta: casteName,
            biologia: obs.biology_notes || '',
            observaciones: obs.general_observations || '',
            estado_conservacion: obs.conservation_status || '',
            met_cons: obs.collection.preservation_method?.method_name || '',

            // Climate data
            t_min: climate?.t_min || '',
            t_max: climate?.t_max || '',
            t_med: climate?.t_med || '',
            hr_min: climate?.hr_min || '',
            hr_max: climate?.hr_max || '',
            hr_med: climate?.hr_med || '',
            pp_14_dias_antes: climate?.pp_14_days_before || '',
            pp_30_dias_antes: climate?.pp_30_days_before || '',
          };
        }),
      );

      return csvData;
    } catch (error) {
      throw new BadRequestException(`Export failed: ${error.message}`);
    }
  }

  /**
   * Find all deleted observations
   */
  findDeleted() {
    return (this.prismaService.observation.findMany as any)({
      where: {
        deleted_at: {
          not: null,
        },
      },
      include: {
        taxon: {
          select: {
            name: true,
            taxonomic_level: {
              select: {
                name: true,
              },
            },
          },
        },
        collection: {
          select: {
            collection_date: true,
            person: {
              select: {
                person_name: true,
                person_lastname: true,
              },
            },
          },
        },
        geolocation: {
          select: {
            latitude: true,
            longitude: true,
            locality: {
              select: {
                locality_name: true,
              },
            },
          },
        },
        environment: {
          select: {
            environment_name: true,
          },
        },
      },
      withDeleted: true,
      orderBy: {
        deleted_at: 'desc',
      },
    });
  }

  /**
   * Restore a soft-deleted observation and its associated collection
   */
  async restore(id: number) {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Get observation to find associated collection
        const observation = await (prisma.observation.findUnique as any)({
          where: { id_observation: id },
          withDeleted: true,
        });

        if (!observation) {
          throw new NotFoundException(`Observation with ID ${id} not found`);
        }

        // Restore collection first
        await (prisma.collection.update as any)({
          where: { id_collection: observation.id_collection },
          data: { deleted_at: null },
          withDeleted: true,
        });

        // Restore observation
        return await (prisma.observation.update as any)({
          where: { id_observation: id },
          data: { deleted_at: null },
          withDeleted: true,
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Observation with ID ${id} not found`);
    }
  }
}
