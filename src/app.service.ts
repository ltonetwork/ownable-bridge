import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as process from 'process';

@Injectable()
export class AppService {
  async getInfo(): Promise<{
    name: string;
    version: string;
    description: string;
    env: string;
  }> {
    const info = JSON.parse(await fs.readFile('package.json', 'utf-8'));

    return {
      name: info.name,
      version: info.version,
      description: info.description,
      env: process.env.NODE_ENV || 'development',
    };
  }
}
