import { Module } from '@nestjs/common';
import { OwnableController } from './ownable.controller';
import { LtoModule } from '../common/lto/lto.module';
import { CosmWasmModule } from '../cosmwasm/cosmwasm.module';
import { PackageModule } from '../package/package.module';
import { ConfigModule } from '../common/config/config.module';
import { EthersModule } from '../common/ethers/ethers.module';
import { NFTModule } from '../nft/nft.module';
import { LtoIndexModule } from '../common/lto-index/lto-index.module';
import { OwnableService } from './ownable.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    LtoModule,
    CosmWasmModule,
    PackageModule,
    EthersModule,
    NFTModule,
    LtoIndexModule,
    HttpModule,
  ],
  providers: [OwnableService],
  controllers: [OwnableController],
})
export class OwnableModule {}
