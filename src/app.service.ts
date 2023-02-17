import { Injectable, OnModuleInit } from '@nestjs/common';
import fs from 'fs/promises';
import * as process from 'process';

@Injectable()
export class AppService implements OnModuleInit {
  info: {
    name: string;
    version: string;
    description: string;
    env: string;
  };

  async onModuleInit(): Promise<void> {
    const packageInfo = JSON.parse(await fs.readFile('package.json', 'utf-8'));

    this.info = {
      name: packageInfo.name,
      version: packageInfo.version,
      description: packageInfo.description,
      env: process.env['NODE_ENV'] || 'development',
    };
  }
}
