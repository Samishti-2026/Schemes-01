import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scheme } from '../schemes/scheme.entity';
import { Recipient } from '../recipients/recipient.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Scheme)
    private readonly schemeRepo: Repository<Scheme>,
    @InjectRepository(Recipient)
    private readonly recipientRepo: Repository<Recipient>,
  ) {}

  async getKpis() {
    const totalSchemes = await this.schemeRepo.count();
    const activeSchemes = await this.schemeRepo.count({
      where: { status: 'active' },
    });

    // Sum of all recipient currentTO as proxy for revenue
    const recipients = await this.recipientRepo.find();
    const totalRevenue = recipients.reduce(
      (sum, r) => sum + Number(r.currentTO),
      0,
    );
    const avgOrderValue =
      recipients.length > 0 ? totalRevenue / recipients.length : 0;

    return {
      totalRevenue: `$${(totalRevenue / 1000).toFixed(0)}K`,
      totalRevenueRaw: totalRevenue,
      activeSchemes: activeSchemes.toString(),
      totalSchemes,
      avgOrderValue: `$${Math.round(avgOrderValue)}`,
      avgOrderValueRaw: avgOrderValue,
      // Mock percentages — in production, compare periods
      revenueChange: '+12%',
      schemesChange: '0%',
      avgOrderChange: '-2%',
    };
  }

  getChartData(period: string = 'weekly') {
    // Generate realistic chart data points
    // In production, this would aggregate from transactions table
    const weeklyData = [
      { label: 'Mon', value: 20 },
      { label: 'Tue', value: 45 },
      { label: 'Wed', value: 30 },
      { label: 'Thu', value: 60 },
      { label: 'Fri', value: 55 },
      { label: 'Sat', value: 85 },
      { label: 'Sun', value: 70 },
    ];

    const monthlyData = [
      { label: 'Jan', value: 35 },
      { label: 'Feb', value: 50 },
      { label: 'Mar', value: 45 },
      { label: 'Apr', value: 70 },
      { label: 'May', value: 60 },
      { label: 'Jun', value: 80 },
      { label: 'Jul', value: 75 },
      { label: 'Aug', value: 90 },
      { label: 'Sep', value: 65 },
      { label: 'Oct', value: 85 },
      { label: 'Nov', value: 95 },
      { label: 'Dec', value: 88 },
    ];

    return period === 'monthly' ? monthlyData : weeklyData;
  }
}
