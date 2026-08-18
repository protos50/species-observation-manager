import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../auth/enums/role.enum';

@ApiTags('environment')
@ApiBearerAuth()
@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Roles(...WRITE_ROLES)
  @Post()
  @ApiOperation({ summary: 'Create a new environment' })
  @ApiResponse({ status: 201, description: 'Environment created successfully.' })
  create(@Body() createEnvironmentDto: CreateEnvironmentDto) {
    return this.environmentService.create(createEnvironmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all environments' })
  @ApiResponse({ status: 200, description: 'List of all environments.' })
  findAll() {
    return this.environmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get environment by ID' })
  @ApiResponse({ status: 200, description: 'Environment found.' })
  @ApiResponse({ status: 404, description: 'Environment not found.' })
  findOne(@Param('id') id: string) {
    return this.environmentService.findOne(+id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  @ApiOperation({ summary: 'Update environment by ID' })
  @ApiResponse({ status: 200, description: 'Environment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Environment not found.' })
  update(@Param('id') id: string, @Body() updateEnvironmentDto: UpdateEnvironmentDto) {
    return this.environmentService.update(+id, updateEnvironmentDto);
  }

  @Roles(...WRITE_ROLES)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete environment by ID' })
  @ApiResponse({ status: 200, description: 'Environment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Environment not found.' })
  remove(@Param('id') id: string) {
    return this.environmentService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.environmentService.checkIfInUse(+id);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.environmentService.findDeleted();
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.environmentService.restore(+id);
  }
}
