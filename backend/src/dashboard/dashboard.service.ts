import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scheme } from '../schemes/scheme.entity';
import { Recipient } from '../recipients/recipient.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Scheme)
    private readonly schemeRepo: Repository<Scheme>,
    @InjectRepository(Recipient)
    private readonly recipientRepo: Repository<Recipient>,
  ) {}

  async getSummary() {
    const recipients = await this.recipientRepo.find();
    const totalRevenue = recipients.reduce(
      (sum, r) => sum + Number(r.currentTO),
      0,
    );

    const activeSchemes = await this.schemeRepo.count({
      where: { status: 'active' },
    });

    // Sales target (could be configurable)
    const salesTarget = 2200000;
    const progressPercent = Math.min(
      Math.round((totalRevenue / salesTarget) * 100),
      100,
    );

    return {
      totalSales: `$${totalRevenue.toLocaleString()}`,
      totalSalesRaw: totalRevenue,
      salesTarget: `$${(salesTarget / 1000000).toFixed(1)}M`,
      salesTargetRaw: salesTarget,
      progressPercent,
      activeSchemes,
      quarterLabel: 'Q3',
      changePercent: '+12.5% vs Q2',
    };
  }

  async getUpcomingSchemes() {
    return this.schemeRepo.find({
      where: { status: 'upcoming' },
      order: { startDate: 'ASC' },
      take: 5,
      select: ['id', 'name', 'startDate', 'endDate', 'status'],
    });
  }
}
