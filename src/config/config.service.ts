import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as convict from 'convict';
import * as fs from 'fs/promises';
import { config, schema } from './data';

@Injectable()
export class ConfigService implements OnModuleInit, OnModuleDestroy {
  private config: convict.Config<any>;
  private packageInfo: { [_: string]: any };
  private readonly ttl: number = 300000; // 5 minutes in milliseconds
  private reloadInterval: NodeJS.Timer;

  async onModuleInit() {
    if (!this.config) {
      await this.load();
    }

    if (!this.reloadInterval) {
      this.reloadInterval = setInterval(async () => {
        await this.load();
      }, this.ttl);
    }

    this.packageInfo = JSON.parse(await fs.readFile('package.json', 'utf-8'));
  }

  async onModuleDestroy() {
    if (this.reloadInterval) {
      clearInterval(this.reloadInterval);
    }
  }

  private async load(): Promise<void> {
    this.config = convict(schema);

    const key = this.config.get('env');
    if (config[key]) {
      this.config.load(config[key]);
    }

    await this.config.validate({ allowed: 'warn' });
  }

  get(key?: string): any {
    return this.config.get(key);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  getPackageInfo(): { [_: string]: any } {
    return this.packageInfo;
  }
}
