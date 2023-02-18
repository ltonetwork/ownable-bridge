import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [EthersService],
  exports: [EthersService],
})
export class EthersModule {}
