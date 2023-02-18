import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { ConfigModule } from '../config/config.module';

@Module({
  providers: [EthersService],
  exports: [EthersService],
  imports: [ConfigModule],
})
export class EthersModule {}
