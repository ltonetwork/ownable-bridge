import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class IpfsService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('IPFS') private ipfs: IPFS, private config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get('ipfs.start')) {
      await this.ipfs.start();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.ipfs.stop();
  }
}
