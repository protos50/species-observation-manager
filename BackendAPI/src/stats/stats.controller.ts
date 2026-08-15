import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /api/stats/dashboard
   * Obtiene todas las estadísticas del dashboard en una sola llamada
   * Requiere: JWT token en header Authorization
   */
  @Get('dashboard')
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  /**
   * GET /api/stats/taxonomy
   * Estadísticas de taxonomía: subfamilias, géneros, especies
   * Requiere: JWT token en header Authorization
   */
  @Get('taxonomy')
  async getTaxonomyStats() {
    return this.statsService.getTaxonomyStats();
  }

  /**
   * GET /api/stats/environments
   * Distribución de observaciones por tipo de ambiente
   * Requiere: JWT token en header Authorization
   */
  @Get('environments')
  async getEnvironmentStats() {
    return this.statsService.getEnvironmentStats();
  }

  /**
   * GET /api/stats/common-species
   * Especies más encontradas
   * Requiere: JWT token en header Authorization
   */
  @Get('common-species')
  async getCommonSpecies() {
    return this.statsService.getCommonSpecies();
  }

  /**
   * GET /api/stats/by-country
   * Conteo de observaciones por país y provincia (para mapa interactivo)
   */
  @Get('by-country')
  async getStatsByCountry() {
    return this.statsService.getStatsByCountry();
  }

  /**
   * GET /api/stats/province/:provinceName
   * Estadísticas detalladas de una provincia específica
   * Incluye: top 10 especies, total observaciones, total especies, total géneros, salidas de campo
   */
  @Get('province/:provinceName')
  async getProvinceStats(@Param('provinceName') provinceName: string) {
    return this.statsService.getProvinceStats(provinceName);
  }

  /**
   * GET /api/stats/province/:provinceName/top-localities
   * Top 5 localidades con más observaciones en una provincia específica
   */
  @Get('province/:provinceName/top-localities')
  async getTopLocalitiesByProvince(@Param('provinceName') provinceName: string) {
    return this.statsService.getTopLocalitiesByProvince(provinceName);
  }
}
