import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Scheme } from './scheme.entity';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { UpdateSchemeDto } from './dto/update-scheme.dto';

@Injectable()
export class SchemesService {
  constructor(
    @InjectRepository(Scheme)
    private readonly schemeRepo: Repository<Scheme>,
  ) { }

  async findAll(query: {
    region?: string;
    type?: string;
    search?: string;
    status?: string;
  }): Promise<Scheme[]> {
    const where: FindOptionsWhere<Scheme> = {};

    if (query.region && query.region !== 'all') {
      where.region = ILike(`%${query.region}%`);
    }
    if (query.type && query.type !== 'all') {
      where.targetType = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    return this.schemeRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Scheme> {
    const scheme = await this.schemeRepo.findOne({ where: { id } });
    if (!scheme) throw new NotFoundException(`Scheme #${id} not found`);
    return scheme;
  }

  async create(dto: CreateSchemeDto): Promise<Scheme> {
    const status =
      dto.startDate && new Date(dto.startDate) > new Date()
        ? 'upcoming'
        : 'active';

    const typeDisplay = (dto.targetType || 'total_sales')
      .toUpperCase()
      .replace('_', ' ');

    const regionDisplay =
      !dto.regionFilter || dto.regionFilter === 'all'
        ? 'All Regions'
        : dto.regionFilter.charAt(0).toUpperCase() + dto.regionFilter.slice(1);

    const category =
      dto.targetType === 'category_qty'
        ? dto.selectedTargetItem || 'All'
        : dto.targetType === 'product_qty'
          ? 'Specific Product'
          : 'All';

    const scheme = this.schemeRepo.create({
      name: dto.schemeName,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status,
      targetType: typeDisplay,
      selectedTargetItem: dto.selectedTargetItem,
      targetValue: dto.targetValue,
      targetUnit: dto.targetUnit || 'amount',
      rules: dto.rules || [],
      totalBudget: dto.totalBudget,
      maxQualifiers: dto.maxQualifiers,
      payoutType: dto.payoutType || 'Fixed Amount',
      payoutAmount: dto.payoutAmount || 0,
      payoutPerPerson: dto.payoutPerPerson,
      recipientType: dto.recipientType,
      regionFilter: dto.regionFilter,
      region: regionDisplay,
      category,
      targets: 0,
      revenue: '-',
    });

    return this.schemeRepo.save(scheme);
  }

  async update(id: number, dto: UpdateSchemeDto): Promise<Scheme> {
    const scheme = await this.findOne(id);
    Object.assign(scheme, dto);
    if (dto.schemeName) scheme.name = dto.schemeName;
    return this.schemeRepo.save(scheme);
  }

  async remove(id: number): Promise<void> {
    const scheme = await this.findOne(id);
    await this.schemeRepo.remove(scheme);
  }

  async getUpcoming(): Promise<Scheme[]> {
    return this.schemeRepo.find({
      where: { status: 'upcoming' },
      order: { startDate: 'ASC' },
      take: 5,
    });
  }
}
