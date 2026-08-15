import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaxonomicLevelService } from './taxonomic-level.service';
import { CreateTaxonomicLevelDto } from './dto/create-taxonomic-level.dto';
import { UpdateTaxonomicLevelDto } from './dto/update-taxonomic-level.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('taxonomic-level')
@ApiBearerAuth()
@Controller('taxonomic-level')
export class TaxonomicLevelController {
  constructor(private readonly taxonomicLevelService: TaxonomicLevelService) {}

  @Post()
  create(@Body() createTaxonomicLevelDto: CreateTaxonomicLevelDto) {
    return this.taxonomicLevelService.create(createTaxonomicLevelDto);
  }

  @Get()
  findAll() {
    return this.taxonomicLevelService.findAll();
  }
  @Get('deleted')
  findDeleted() {
    return this.taxonomicLevelService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxonomicLevelService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaxonomicLevelDto: UpdateTaxonomicLevelDto,
  ) {
    return this.taxonomicLevelService.update(+id, updateTaxonomicLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxonomicLevelService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.taxonomicLevelService.checkIfInUse(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.taxonomicLevelService.restore(+id);
  }
}
