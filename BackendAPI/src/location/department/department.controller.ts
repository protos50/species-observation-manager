import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../../auth/enums/role.enum';

@ApiTags('department')
@ApiBearerAuth()
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Roles(...WRITE_ROLES)
  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  findAll() {
    return this.departmentService.findAll();
  }

  @Get('province/:provinceId')
  findByProvince(@Param('provinceId') provinceId: string) {
    return this.departmentService.findByProvince(+provinceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(+id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(+id, updateDepartmentDto);
  }

  @Roles(...WRITE_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.departmentService.checkIfInUse(+id);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.departmentService.findDeleted();
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.departmentService.restore(+id);
  }
}
