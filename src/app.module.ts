import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PackageModule } from './package/package.module';
import { OwnableModule } from './ownable/ownable.module';
import { ConfigModule } from './common/config/config.module';
import { EthersModule } from './common/ethers/ethers.module';

@Module({
  imports: [ConfigModule, PackageModule, OwnableModule, EthersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
