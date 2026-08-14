import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TaxonService } from './taxon.service';
import { CreateTaxonDto } from './dto/create-taxon.dto';
import { UpdateTaxonDto } from './dto/update-taxon.dto';

@Controller('taxon')
export class TaxonController {
  constructor(private readonly taxonService: TaxonService) {}

  @Post()
  create(@Body() createTaxonDto: CreateTaxonDto) {
    return this.taxonService.create(createTaxonDto);
  }

  @Get()
  findAll() {
    return this.taxonService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.taxonService.findDeleted();
  }

  @Get('search')
  search(@Query('term') searchTerm: string) {
    return this.taxonService.searchTaxa(searchTerm);
  }

  @Get('level/:levelId')
  findByLevel(@Param('levelId') levelId: string) {
    return this.taxonService.findByTaxonomicLevel(+levelId);
  }

  @Get('children/:parentId')
  findChildren(@Param('parentId') parentId: string) {
    return this.taxonService.findChildren(+parentId);
  }

  @Get('hierarchy/:id')
  getHierarchy(@Param('id') id: string) {
    return this.taxonService.getTaxonomicHierarchy(+id);
  }

  @Get('descendants/:id')
  getDescendants(@Param('id') id: string) {
    return this.taxonService.getTaxonomicDescendants(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.taxonService.checkIfInUse(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaxonDto: UpdateTaxonDto) {
    return this.taxonService.update(+id, updateTaxonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxonService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.taxonService.restore(+id);
  }
}
