import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SchemeConfig } from './scheme-config.entity';

@Injectable()
export class SchemeConfigsService {

  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<SchemeConfig> {
    return this.dataSource.getRepository(SchemeConfig);
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: string) {
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: Partial<SchemeConfig>) {
    const config = this.repository.create(data);
    return this.repository.save(config);
  }

  async update(id: string, data: Partial<SchemeConfig>) {
    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repository.delete(id);
  }
}
