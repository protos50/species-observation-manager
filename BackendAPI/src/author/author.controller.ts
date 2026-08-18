import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { WRITE_ROLES } from '../auth/enums/role.enum';

@ApiTags('author')
@ApiBearerAuth()
@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Roles(...WRITE_ROLES)
  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.create(createAuthorDto);
  }

  @Get()
  findAll() {
    return this.authorService.findAll();
  }
  @Get('deleted')
  findDeleted() {
    return this.authorService.findDeleted();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.findOne(id);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorService.update(id, updateAuthorDto);
  }

  @Roles(...WRITE_ROLES)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.remove(id);
  }
  @Roles(...WRITE_ROLES)
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.restore(id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.checkIfInUse(id);
  }
}
