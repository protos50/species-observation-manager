import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CasteService } from './caste.service';
import { CreateCasteDto } from './dto/create-caste.dto';
import { UpdateCasteDto } from './dto/update-caste.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('caste')
@ApiBearerAuth()
@Controller('caste')
export class CasteController {
  constructor(private readonly casteService: CasteService) {}

  @Post()
  create(@Body() createCasteDto: CreateCasteDto) {
    return this.casteService.create(createCasteDto);
  }

  @Get()
  findAll() {
    return this.casteService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.casteService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCasteDto: UpdateCasteDto) {
    return this.casteService.update(+id, updateCasteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casteService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.casteService.checkIfInUse(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.casteService.restore(+id);
  }
}
