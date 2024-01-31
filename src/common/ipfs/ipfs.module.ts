import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ipfsProviders } from './ipfs.providers';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [...ipfsProviders],
  exports: [...ipfsProviders],
})
export class IpfsModule implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('IPFS') private readonly ipfs: IPFS, private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get('ipfs.start')) await this.ipfs.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.ipfs.stop();
  }
}
