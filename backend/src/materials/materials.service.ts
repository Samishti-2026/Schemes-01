import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Material } from '../entities/material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly dataSource: DataSource,
  ) {}

  private get repository(): Repository<Material> {
    return this.dataSource.getRepository(Material);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(material: number) {
    return this.repository.findOne({ where: { material } });
  }

  create(data: Partial<Material>) {
    const material = this.repository.create(data);
    return this.repository.save(material);
  }
}
