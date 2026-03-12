import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,
  ) {}

  async get(): Promise<Setting> {
    let settings = await this.settingRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      // Create default settings
      settings = this.settingRepo.create({
        displayName: 'Executive',
        email: 'executive@samishti.com',
        emailAlerts: true,
        weeklyReports: true,
        systemUpdates: true,
      });
      await this.settingRepo.save(settings);
    }
    return settings;
  }

  async update(data: Partial<Setting>): Promise<Setting> {
    const settings = await this.get();
    Object.assign(settings, data);
    return this.settingRepo.save(settings);
  }
}
