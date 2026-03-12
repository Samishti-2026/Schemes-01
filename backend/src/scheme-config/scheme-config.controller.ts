import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchemeConfigService } from './scheme-config.service';
import { SaveConfigDto } from './dto/save-config.dto';

@ApiTags('Scheme Config')
@Controller('api/scheme-config')
export class SchemeConfigController {
  constructor(private readonly service: SchemeConfigService) { }

  // POST /api/scheme-config — save or update config
  @Post()
  async save(@Body() dto: SaveConfigDto) {
    return this.service.save(dto);
  }

  // GET /api/scheme-config?name=default — get config by name
  @Get()
  async get(@Query('name') name?: string) {
    return this.service.findByName(name || 'default');
  }

  // GET /api/scheme-config/all — get all configs
  @Get('all')
  async getAll() {
    return this.service.findAll();
  }
}
