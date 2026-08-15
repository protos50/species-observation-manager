import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TrapService } from './trap.service';
import { CreateTrapDto } from './dto/create-trap.dto';
import { UpdateTrapDto } from './dto/update-trap.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('trap')
@ApiBearerAuth()
@Controller('trap')
export class TrapController {
  constructor(private readonly trapService: TrapService) {}

  @Post()
  create(@Body() createTrapDto: CreateTrapDto) {
    return this.trapService.create(createTrapDto);
  }

  @Get()
  findAll() {
    return this.trapService.findAll();
  }

  @Get('deleted')
  findDeleted() {
    return this.trapService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trapService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrapDto: UpdateTrapDto) {
    return this.trapService.update(+id, updateTrapDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trapService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.trapService.checkIfInUse(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.trapService.restore(+id);
  }
}
