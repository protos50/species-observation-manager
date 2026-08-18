import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ObservationService } from './observation.service';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { CreateCollectionObservationDto } from './dto/create-collection-observation.dto';
import { SearchObservationDto } from './dto/search-observation.dto';
import { ExportCsvDto } from './dto/export-csv.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../auth/enums/role.enum';

@ApiTags('observation')
@ApiBearerAuth()
@Controller('observation')
export class ObservationController {
  constructor(private readonly observationService: ObservationService) {}

  /**
   * Crea la coleccion y la observacion de una sola vez.
   */
  @Roles(...WRITE_ROLES)
  @Post('with-collection')
  createWithCollection(@Body() createDto: CreateCollectionObservationDto) {
    return this.observationService.createCollectionAndObservation(createDto);
  }

  /**
   * Lista las observaciones paginadas.
   */
  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.observationService.findAll(pagination.page, pagination.limit);
  }

  /**
   * Busca observaciones con los filtros del panel, paginadas.
   */
  @Get('search')
  search(@Query() searchDto: SearchObservationDto) {
    return this.observationService.searchObservations(searchDto);
  }

  /**
   * Find observations by taxon
   */
  @Get('taxon/:taxonId')
  findByTaxon(@Param('taxonId') taxonId: string) {
    return this.observationService.findByTaxon(+taxonId);
  }

  /**
   * Find observations by locality
   */
  @Get('locality/:localityId')
  findByLocality(@Param('localityId') localityId: string) {
    return this.observationService.findByLocality(+localityId);
  }

  /**
   * Find observation by collection ID
   */
  @Get('collection/:collectionId')
  findByCollection(@Param('collectionId') collectionId: string) {
    return this.observationService.findByCollection(+collectionId);
  }

  /**
   * Get a specific observation by ID
   */

  @Get('deleted')
  findDeleted() {
    return this.observationService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.observationService.findOne(+id);
  }

  /**
   * Update an observation
   */
  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateObservationDto: UpdateObservationDto,
  ) {
    return this.observationService.update(+id, updateObservationDto);
  }

  /**
   * Da de baja una observacion junto con su coleccion.
   */
  @Roles(...WRITE_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.observationService.remove(+id);
  }

  /**
   * Restore a soft-deleted observation
   */
  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.observationService.restore(+id);
  }

  /**
   * Get all deleted observations
   */

  /**
   * Exporta las observaciones a CSV para analizarlas en R.
   * Respeta la estructura del Excel original para no romper lo que ya se usaba.
   */
  @Get('export/csv')
  async exportCsv(@Query() filters: ExportCsvDto, @Res() res: Response) {
    try {
      const data = await this.observationService.exportToCsv(filters);

      // Arma el CSV
      if (data.length === 0) {
        return res
          .status(200)
          .json({ message: 'No data found for export', data: [] });
      }

      const headers = Object.keys(data[0]);

      // Escapa cada valor para que el CSV no se rompa
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) {
          return '';
        }

        const stringValue = String(value);

        // Si el valor trae comas, comillas, saltos de linea o espacios al borde, va entrecomillado
        if (
          stringValue.includes(',') ||
          stringValue.includes('"') ||
          stringValue.includes('\n') ||
          stringValue.includes('\r') ||
          stringValue.startsWith(' ') ||
          stringValue.endsWith(' ')
        ) {
          // Las comillas internas se duplican, que es como las espera el formato
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      };

      const csvContent = [
        headers.map((h) => escapeCsvValue(h)).join(','), // Header row
        ...data.map((row) =>
          headers.map((header) => escapeCsvValue(row[header])).join(','),
        ),
      ].join('\n');

      // Cabeceras para que el navegador lo baje como archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `observaciones_gema_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      // El BOM va para que Excel respete los acentos
      res.write('\uFEFF');
      res.end(csvContent);
    } catch (error) {
      return res.status(500).json({
        message: 'Export failed',
        error: error.message,
      });
    }
  }
}
