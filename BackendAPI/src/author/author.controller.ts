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

@ApiTags('author')
@ApiBearerAuth()
@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.remove(id);
  }
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.restore(id);
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.checkIfInUse(id);
  }
}
