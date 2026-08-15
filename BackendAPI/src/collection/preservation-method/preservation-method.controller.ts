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

@ApiTags('preservation-method')
@ApiBearerAuth()
@Controller('preservation-method')
export class PreservationMethodController {
  constructor(
    private readonly preservationMethodService: PreservationMethodService,
  ) {}

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preservationMethodService.remove(+id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.preservationMethodService.checkIfInUse(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.preservationMethodService.restore(+id);
  }
}
