import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClimateDataService } from './climate-data.service';
import { CreateClimateDatumDto } from './dto/create-climate-datum.dto';
import { UpdateClimateDatumDto } from './dto/update-climate-datum.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../auth/enums/role.enum';

@ApiTags('climate-data')
@ApiBearerAuth()
@Controller('climate-data')
export class ClimateDataController {
  constructor(private readonly climateDataService: ClimateDataService) {}

  @Roles(...WRITE_ROLES)
  @Post()
  create(@Body() createClimateDatumDto: CreateClimateDatumDto) {
    return this.climateDataService.create(createClimateDatumDto);
  }

  @Get()
  findAll() {
    return this.climateDataService.findAll();
  }

  @Get('search')
  findByLocalityAndDate(
    @Query('locality_id') localityId: string,
    @Query('date') date: string,
  ) {
    return this.climateDataService.findByLocalityAndDate(+localityId, date);
  }

  @Get('locality/:localityId')
  findByLocality(@Param('localityId') localityId: string) {
    return this.climateDataService.findByLocality(+localityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.climateDataService.findOne(+id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClimateDatumDto: UpdateClimateDatumDto) {
    return this.climateDataService.update(+id, updateClimateDatumDto);
  }

  @Roles(...WRITE_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.climateDataService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.climateDataService.checkIfInUse(+id);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.climateDataService.findDeleted();
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.climateDataService.restore(+id);
  }
}
