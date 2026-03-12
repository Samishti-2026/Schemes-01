import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatasetsService, DatasetDef } from './datasets.service';

@ApiTags('Datasets')
@Controller('api/datasets')
export class DatasetsController {
  constructor(private readonly service: DatasetsService) { }

  @Get()
  findAll(): Promise<DatasetDef[]> {
    return this.service.findAll();
  }
}