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
import { Roles } from '../../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../../auth/enums/role.enum';

@ApiTags('trap')
@ApiBearerAuth()
@Controller('trap')
export class TrapController {
  constructor(private readonly trapService: TrapService) {}

  @Roles(...WRITE_ROLES)
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

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrapDto: UpdateTrapDto) {
    return this.trapService.update(+id, updateTrapDto);
  }

  @Roles(...WRITE_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trapService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.trapService.checkIfInUse(+id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.trapService.restore(+id);
  }
}
