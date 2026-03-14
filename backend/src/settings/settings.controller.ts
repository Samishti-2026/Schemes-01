import { Controller, Get, Put, Body } from '@nestjs/common';

@Controller('settings')
export class SettingsController {
  private settings = {
    theme: 'dark',
    notifications: true,
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  };

  @Get()
  async getSettings() {
    return this.settings;
  }

  @Put()
  async updateSettings(@Body() data: any) {
    this.settings = { ...this.settings, ...data };
    return this.settings;
  }
}
