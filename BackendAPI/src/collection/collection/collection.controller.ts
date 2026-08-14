import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionService.create(createCollectionDto);
  }

  @Get()
  findAll() {
    return this.collectionService.findAll();
  }

  @Get('person/:personId')
  findByPerson(@Param('personId') personId: string) {
    return this.collectionService.findByPerson(+personId);
  }

  @Get('date-range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.collectionService.findByDateRange(new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionService.update(+id, updateCollectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionService.remove(+id);
  }

  @Post('with-observation')
  addCollectionWithObservation(
    @Body('id_person') personId: number,
    @Body('id_preservation_method') preservationMethodId: number,
    @Body('id_trap') trapId: number,
    @Body('collection_date') collectionDate: string,
    @Body('id_taxon') taxonId: number,
    @Body('id_locality') localityId: number
  ) {
    return this.collectionService.addCollectionWithObservation(
      personId, 
      preservationMethodId, 
      trapId, 
      new Date(collectionDate), 
      taxonId, 
      localityId
    );
  }
}
