import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchemesService } from './schemes.service';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { UpdateSchemeDto } from './dto/update-scheme.dto';

@ApiTags('Schemes')
@Controller('api/schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) { }

  @Get()
  findAll(
    @Query('region') region?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.schemesService.findAll({ region, type, search, status });
  }

  @Get('upcoming')
  getUpcoming() {
    return this.schemesService.getUpcoming();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schemesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSchemeDto) {
    return this.schemesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSchemeDto) {
    return this.schemesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schemesService.remove(id);
  }
}
