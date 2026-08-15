import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('province')
@ApiBearerAuth()
@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  create(@Body() createProvinceDto: CreateProvinceDto) {
    return this.provinceService.create(createProvinceDto);
  }

  @Get()
  findAll() {
    return this.provinceService.findAll();
  }

  @Get('country/:countryId')
  findByCountry(@Param('countryId') countryId: string) {
    return this.provinceService.findByCountry(+countryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.provinceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProvinceDto: UpdateProvinceDto) {
    return this.provinceService.update(+id, updateProvinceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.provinceService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.provinceService.checkIfInUse(+id);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.provinceService.findDeleted();
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.provinceService.restore(+id);
  }
}
