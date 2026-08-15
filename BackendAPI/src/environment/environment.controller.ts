import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('environment')
@ApiBearerAuth()
@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

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

  @Patch(':id')
  @ApiOperation({ summary: 'Update environment by ID' })
  @ApiResponse({ status: 200, description: 'Environment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Environment not found.' })
  update(@Param('id') id: string, @Body() updateEnvironmentDto: UpdateEnvironmentDto) {
    return this.environmentService.update(+id, updateEnvironmentDto);
  }

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

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.environmentService.restore(+id);
  }
}
