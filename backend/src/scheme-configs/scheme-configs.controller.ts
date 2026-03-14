import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SchemeConfigsService } from './scheme-configs.service';
import { SchemeConfig } from './scheme-config.entity';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

@ApiTags('scheme-configs')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('scheme-config')
export class SchemeConfigsController {
  constructor(private readonly schemeConfigsService: SchemeConfigsService) {}

  @Get()
  findAll() {
    return this.schemeConfigsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemeConfigsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<SchemeConfig>) {
    return this.schemeConfigsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<SchemeConfig>) {
    return this.schemeConfigsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemeConfigsService.remove(id);
  }
}
