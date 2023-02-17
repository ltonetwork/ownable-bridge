import { Module } from '@nestjs/common';
import { OwnableService } from './ownable.service';
import { OwnableController } from './ownable.controller';
import { LtoModule } from '../common/lto/lto.module';
import { CosmWasmModule } from '../cosmwasm/cosmwasm.module';
import { PackageModule } from '../package/package.module';
import { ConfigModule } from '../common/config/config.module';

@Module({
  imports: [ConfigModule, LtoModule, CosmWasmModule, PackageModule],
  providers: [OwnableService],
  controllers: [OwnableController],
})
export class OwnableModule {}
