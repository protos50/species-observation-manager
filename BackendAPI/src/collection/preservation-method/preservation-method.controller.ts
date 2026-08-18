import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PreservationMethodService } from './preservation-method.service';
import { CreatePreservationMethodDto } from './dto/create-preservation-method.dto';
import { UpdatePreservationMethodDto } from './dto/update-preservation-method.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../../auth/enums/role.enum';

@ApiTags('preservation-method')
@ApiBearerAuth()
@Controller('preservation-method')
export class PreservationMethodController {
  constructor(
    private readonly preservationMethodService: PreservationMethodService,
  ) {}

  @Roles(...WRITE_ROLES)
  @Post()
  create(@Body() createPreservationMethodDto: CreatePreservationMethodDto) {
    return this.preservationMethodService.create(createPreservationMethodDto);
  }

  @Get()
  findAll() {
    return this.preservationMethodService.findAll();
  }
  @Get('deleted')
  findDeleted() {
    return this.preservationMethodService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preservationMethodService.findOne(+id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePreservationMethodDto: UpdatePreservationMethodDto,
  ) {
    return this.preservationMethodService.update(
      +id,
      updatePreservationMethodDto,
    );
  }

  @Roles(...WRITE_ROLES)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preservationMethodService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.preservationMethodService.checkIfInUse(+id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.preservationMethodService.restore(+id);
  }
}
