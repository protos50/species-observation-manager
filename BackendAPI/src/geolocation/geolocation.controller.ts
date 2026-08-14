import { Controller, Get, Post, Body, Param, Put, Delete, Query, NotFoundException } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { Geolocation } from '@prisma/client';
import { CreateGeolocationDto } from './dto/create-geolocation.dto';
import { UpdateGeolocationDto } from './dto/update-geolocation.dto';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Post()
  async create(@Body() createGeolocationDto: CreateGeolocationDto): Promise<Geolocation> {
    return this.geolocationService.create(createGeolocationDto);
  }

  @Get()
  async findAll(): Promise<Geolocation[]> {
    return this.geolocationService.findAll();
  }

  @Get('coordinates')
  async findByCoordinates(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ): Promise<Geolocation[]> {
    return this.geolocationService.findByCoordinates(
      parseFloat(latitude),
      parseFloat(longitude),
    );
  }

  @Get('tag/:tag')
  async findByTag(@Param('tag') tag: string): Promise<Geolocation[]> {
    return this.geolocationService.findByTag(tag);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Geolocation> {
    const geolocation = await this.geolocationService.findOne(+id);
    if (!geolocation) {
      throw new NotFoundException(`Geolocalización con ID ${id} no encontrada`);
    }
    return geolocation;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGeolocationDto: UpdateGeolocationDto,
  ): Promise<Geolocation> {
    try {
      return await this.geolocationService.update(+id, updateGeolocationDto);
    } catch (error) {
      if (error.code === 'P2025') { // Prisma error code for record not found
        throw new NotFoundException(`Geolocalización con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Geolocation> {
    try {
      return await this.geolocationService.remove(+id);
    } catch (error) {
      if (error.code === 'P2025') { // Prisma error code for record not found
        throw new NotFoundException(`Geolocalización con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  @Get(':id/check-in-use')
  checkIfInUse(@Param('id') id: string) {
    return this.geolocationService.checkIfInUse(+id);
  }

  @Get('deleted/list')
  findDeleted() {
    return this.geolocationService.findDeleted();
  }

  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.geolocationService.restore(+id);
  }
}
