import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Setting } from './setting.entity';

@ApiTags('Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Put()
  update(@Body() data: Partial<Setting>) {
    return this.settingsService.update(data);
  }
}
