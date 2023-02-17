import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { ipfsProviders } from './ipfs.providers';
import { IpfsService } from './ipfs.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [...ipfsProviders, IpfsService],
  exports: [...ipfsProviders],
})
export class IpfsModule {}
