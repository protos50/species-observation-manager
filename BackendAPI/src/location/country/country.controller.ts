import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../../auth/enums/role.enum';

@ApiTags('country')
@ApiBearerAuth()
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Roles(...WRITE_ROLES)
  @Post()
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countryService.findOne(+id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countryService.update(+id, updateCountryDto);
  }

  @Roles(...WRITE_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countryService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.countryService.checkIfInUse(+id);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.countryService.findDeleted();
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.countryService.restore(+id);
  }
}
