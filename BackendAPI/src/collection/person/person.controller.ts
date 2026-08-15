import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('person')
@ApiBearerAuth()
@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.personService.findDeleted();
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.personService.checkIfInUse(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personService.update(+id, updatePersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.personService.restore(+id);
  }

  // Métodos adicionales para personRole e identifier han sido eliminados ya que son obsoletos
}
