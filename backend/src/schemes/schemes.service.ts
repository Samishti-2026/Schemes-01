import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Scheme } from './scheme.entity';

@Injectable()
export class SchemesService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Scheme> {
    return this.dataSource.getRepository(Scheme);
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: string) {
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: Partial<Scheme>) {
    const scheme = this.repository.create(data);
    return this.repository.save(scheme);
  }

  async update(id: string, data: Partial<Scheme>) {
    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repository.delete(id);
  }
}
