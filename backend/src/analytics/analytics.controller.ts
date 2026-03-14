import { Controller, Get } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  @Get('kpis')
  async getKpis() {
    return {
      totalRevenue: '₹4.2M',
      revenueChange: '+12%',
      activeSchemes: 12,
      schemesChange: '+2',
      avgOrderValue: '₹35,200',
      avgOrderChange: '+5.4%',
    };
  }

  @Get('chart')
  async getChart() {
    return [
      { name: 'Mon', value: 400 },
      { name: 'Tue', value: 300 },
      { name: 'Wed', value: 600 },
      { name: 'Thu', value: 800 },
      { name: 'Fri', value: 500 },
      { name: 'Sat', value: 900 },
      { name: 'Sun', value: 700 },
    ];
  }
}
