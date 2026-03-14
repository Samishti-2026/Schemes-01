import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get('summary')
  async getSummary() {
    return {
      quarterLabel: 'Q3 2024',
      changePercent: '+14.2%',
      totalSales: '₹42.5L',
      salesTarget: '₹50L',
      progressPercent: 85,
    };
  }

  @Get('upcoming-schemes')
  async getUpcomingSchemes() {
    return [
      { id: 1, name: 'Summer Bonanza', startDate: '2024-06-01', target: '₹10M' },
      { id: 2, name: 'Q3 Growth Stimulus', startDate: '2024-07-15', target: '500+ Qty' },
    ];
  }
}
