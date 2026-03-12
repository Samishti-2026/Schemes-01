import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipient } from './recipient.entity';

@Injectable()
export class RecipientsService {
  constructor(
    @InjectRepository(Recipient)
    private readonly recipientRepo: Repository<Recipient>,
  ) {}

  async findAll(query: {
    recipientType?: string;
    region?: string;
    category?: string;
    product?: string;
  }): Promise<Recipient[]> {
    const qb = this.recipientRepo.createQueryBuilder('r');

    if (query.recipientType) {
      qb.andWhere('LOWER(r.recipientType) = LOWER(:recipientType)', {
        recipientType: query.recipientType,
      });
    }

    if (query.region) {
      qb.andWhere('LOWER(r.region) = LOWER(:region)', {
        region: query.region,
      });
    }

    if (query.category) {
      qb.andWhere('LOWER(r.category) = LOWER(:category)', {
        category: query.category,
      });
    }

    if (query.product) {
      qb.andWhere('r.products LIKE :product', {
        product: `%${query.product}%`,
      });
    }

    return qb.orderBy('r.currentTO', 'DESC').getMany();
  }

  async getFilterOptions(): Promise<{
    regions: string[];
    categories: string[];
    products: string[];
  }> {
    const recipients = await this.recipientRepo.find();

    const regions = [
      ...new Set(recipients.map((r) => r.region).filter(Boolean)),
    ];
    const categories = [
      ...new Set(recipients.map((r) => r.category).filter(Boolean)),
    ];
    const products = [
      ...new Set(recipients.flatMap((r) => r.products || []).filter(Boolean)),
    ];

    return { regions, categories, products };
  }
}
