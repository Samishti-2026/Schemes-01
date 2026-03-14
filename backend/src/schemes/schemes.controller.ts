import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { SchemesService } from './schemes.service';
import { Scheme } from './scheme.entity';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

@ApiTags('schemes')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Get()
  findAll(
    @Query('region') region?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.schemesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Scheme>) {
    return this.schemesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Scheme>) {
    return this.schemesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemesService.remove(id);
  }
}
