import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocalityService } from './locality.service';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';

@Controller('locality')
export class LocalityController {
  constructor(private readonly localityService: LocalityService) {}

  @Post()
  create(@Body() createLocalityDto: CreateLocalityDto) {
    return this.localityService.create(createLocalityDto);
  }

  @Get()
  findAll() {
    return this.localityService.findAll();
  }

  @Get('department/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.localityService.findByDepartment(+departmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocalityDto: UpdateLocalityDto) {
    return this.localityService.update(+id, updateLocalityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localityService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.localityService.checkIfInUse(+id);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.localityService.findDeleted();
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.localityService.restore(+id);
  }
}
