import { Module } from '@nestjs/common';
import { OwnableController } from './ownable.controller';
import { LtoModule } from '../common/lto/lto.module';
import { CosmWasmModule } from '../cosmwasm/cosmwasm.module';
import { PackageModule } from '../package/package.module';
import { ConfigModule } from '../common/config/config.module';
import { EthersModule } from '../common/ethers/ethers.module';
import { OwnableService } from './ownable.service';

@Module({
  imports: [ConfigModule, LtoModule, CosmWasmModule, PackageModule, EthersModule],
  providers: [OwnableService],
  controllers: [OwnableController],
})
export class OwnableModule {}
