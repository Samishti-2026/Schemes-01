import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number): Promise<Product | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Product>): Promise<Product> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
