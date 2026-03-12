import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchemeConfig } from './scheme-config.entity';
import { SaveConfigDto } from './dto/save-config.dto';

@Injectable()
export class SchemeConfigService {
  constructor(
    @InjectRepository(SchemeConfig)
    private readonly repo: Repository<SchemeConfig>,
  ) {}

  // Save or update config (upsert by name)
  async save(dto: SaveConfigDto): Promise<SchemeConfig> {
    const name = dto.name || 'default';
    const existing = await this.repo.findOne({ where: { name } });

    if (existing) {
      existing.config = dto.config;
      return this.repo.save(existing);
    }

    const entity = this.repo.create({ name, config: dto.config });
    return this.repo.save(entity);
  }

  // Get config by name
  async findByName(name = 'default'): Promise<SchemeConfig | null> {
    return this.repo.findOne({ where: { name } });
  }

  // Get all configs
  async findAll(): Promise<SchemeConfig[]> {
    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }
}
