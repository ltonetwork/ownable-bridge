import { Injectable, OnModuleInit } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class AppService implements OnModuleInit {
  info: {
    name: string;
    version: string;
    description: string;
    env: string;
  };

  onModuleInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageInfo = require('../package.json');

    this.info = {
      name: packageInfo.name,
      version: packageInfo.version,
      description: packageInfo.description,
      env: process.env['NODE_ENV'] || 'development',
    };
  }
}
