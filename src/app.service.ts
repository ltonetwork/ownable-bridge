import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  getInfo(): {
    name: string;
    version: string;
    description: string;
    env: string;
  } {
    const { name, version, description } = this.config.getPackageInfo();
    const env = this.config.get('env');

    return { name, version, description, env };
  }
}
