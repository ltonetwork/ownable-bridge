import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PackageModule } from './package/package.module';
import { OwnableModule } from './ownable/ownable.module';
import { CosmWasmModule } from './cosmwasm/cosmwasm.module';

@Module({
  imports: [ConfigModule, PackageModule, OwnableModule, CosmWasmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
