import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PackageModule } from './package/package.module';
import { OwnableModule } from './ownable/ownable.module';

@Module({
  imports: [ConfigModule, PackageModule, OwnableModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
